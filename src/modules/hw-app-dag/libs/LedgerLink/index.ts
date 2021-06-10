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

  constructor (transport: any) {
    this.transport = transport;
  }

  ////////////////////
  // Private
  ////////////////////

  private createBipPathFromAccount (index: number) {
    console.log('createBipPathFromAccount', index);

    const bip44Path =
      '8000002C' +
      '80000471' +
      '80000000' +
      '00000000' +
      `0000000${index}`;

    return bip44Path;

    // return `8000002C80000471${account}0000000000000000`;
  }


  private async getLedgerInfo () {
    const supported = await this.transport.isSupported();
    if (!supported) {
      throw new Error('Your computer does not support the ledger device.');
    }
    const paths: string[] = await this.transport.list();
    if (paths.length === 0) {
      throw new Error('No USB device found.');
    } else {
      return this.transport.open(paths[0]);
    }
  }

  private sendExchangeMessage (bip44Path: String, device: any): Promise<LedgerMessageResponse> {
    return  new Promise((resolve, reject) => {
      const message = Buffer.from(DEVICE_ID + bip44Path, 'hex');
      device.exchange(message).then((response: Buffer) => {
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

  public async getPublicKeys (numberOfAccounts: number, progressUpdateCallback?: (progress: number) => void) {
    if (!this.transport) {
      throw new Error('Error: A transport must be set via the constructor before calling this method');
    }
    if (isNaN(numberOfAccounts) || numberOfAccounts < 1 || Math.floor(numberOfAccounts) !== numberOfAccounts) {
      throw new Error('Error: Number of accounts must be an integer greater than zero');
    }

    const device = await this.getLedgerInfo();

    let results = [];

    // Get the public key for each account
    for (let i = 0; i < numberOfAccounts; i++) {

      const bip44Path = this.createBipPathFromAccount(i);
      const result = await this.sendExchangeMessage(bip44Path, device)

      results.push(result);

      if(progressUpdateCallback) {
        progressUpdateCallback((i+1) / numberOfAccounts)
      }
    }

    device.close();

    return results;
  };
}

type LedgerMessageResponse = {
  success: boolean,
  message: string,
  publicKey: string,
}

export default LedgerLink;
