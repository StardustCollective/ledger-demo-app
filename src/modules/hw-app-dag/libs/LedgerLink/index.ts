// max length in bytes.
const MAX_SIGNED_TX_LEN = 512;

const debug = false;

const DEVICE_ID = '8004000000';

const ACCOUNTS = [
  '80000000',
  '70000000',
  '60000000',
  '50000000',
  '40000000',
  '30000000',
  '20000000',
  '10000000',
];

////////////////////
// Interfaces
////////////////////

interface Message {
  enabled: boolean; 
  error: boolean; 
  message: String;
}

////////////////////
// Class
////////////////////

class LedgerLink {

  ////////////////////
  // Properties
  ////////////////////

  transport: any;

  ////////////////////
  // Constructor
  ////////////////////

  constructor(transport: any){
    this.transport = transport;
  }

  ////////////////////
  // Private
  ////////////////////

  private createBipPathFromAccount = (account: String) => {
    return `8000002C80000471${account}0000000000000000`;
  }
  

  private getLedgerInfo =  async (deviceThenCallback: Function, deviceErrorCallback: Function) => {
    const supported = await this.transport.isSupported();
    if (!supported) {
      deviceErrorCallback(this.finishLedgerDeviceInfo({
        enabled: false,
        error: true,
        message: 'Your computer does not support the ledger device.',
      }));
      return;
    }
    this.transport.list().then((paths: Array<String>) => {
      if (paths.length === 0) {
        deviceErrorCallback(this.finishLedgerDeviceInfo({
          enabled: false,
          error: false,
          message: 'No USB device found.',
        }));
      } else {
        const path = paths[0];
        this.transport.open(path).then((device: any) => {
          deviceThenCallback(device);
        }, (error: Error) => {
          deviceErrorCallback(error);
        });
      }
    }, (error: Error) => {
      deviceErrorCallback(error);
    });
  };

  private finishLedgerDeviceInfo = (msg: Message ) => {
    return msg;
  };

  private sendExchangeMessage = (bip44Path: String, device: any) => {
    return  new Promise((resolve, reject) => {
      const message = Buffer.from(DEVICE_ID + bip44Path, 'hex');
      device.exchange(message).then((response: any) => {
        const responseStr = response.toString('hex').toUpperCase();
        let success = false;
        let message = '';
        let publicKey = '';
        if (responseStr.endsWith('9000')) {
          success = true;
          message = responseStr;
          publicKey = responseStr.substring(0, 130);
        } else {
          if (responseStr == '6E01') {
            message = '6E01 App Not Open On Ledger Device';
            throw new Error(message);
          } else {
            message = responseStr + ' Unknown Error';
          }
        }
        resolve({
          success: success,
          message: message,
          publicKey: publicKey,
        });
      }).catch((error: Error) => {
        reject({
          success: false,
          message: error.message,
        });
      });
    })
  }

  ///////////////////////
  // Public Methods
  ///////////////////////

  public getPublicKeys = (callback: Function, progressUpdateCallback?: Function) => {
    if(!this.transport){
      throw new Error('Error: A transport must be set via the constructor before calling this method');
    }
    const deviceThenCallback = async (device: any) => {
      let promiseArray = [];
      try {
        // Get the public key for each account
        for(let i = 0; i < ACCOUNTS.length; i++){
          const bip44Path = this.createBipPathFromAccount(ACCOUNTS[i]);
          const result = await this.sendExchangeMessage(bip44Path, device)
          promiseArray.push(result);
          if(progressUpdateCallback) {
            progressUpdateCallback((i + 1)/ACCOUNTS.length)
          }
        }
        device.close();
        callback(await Promise.all(promiseArray));
      } catch (error) {
        callback({
          success: false,
          message: error.message,
        });
      }
    };
    const deviceErrorCallback = (error: Error) => {
      callback({
        success: false,
        message: error.message,
      });
    };
    this.getLedgerInfo(deviceThenCallback, deviceErrorCallback);
  };
}

export default LedgerLink;
