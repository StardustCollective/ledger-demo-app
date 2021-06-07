'use strict';

// max length in bytes.
const MAX_SIGNED_TX_LEN = 512;

const debug = false;

const DEVICE_ID = '8004000000';
// const bip44Path =
//   '8000002C' +
//   '80000471' +
//   '80000000' +
//   '00000000' +
//   '00000000';

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

  public getPublicKeysForAllAccounts = (callback: Function, progressUpdateCallback?: Function) => {
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

// const getLedgerDeviceInfo = (transport, callback) => {
//   const deviceThenCallback = (device) => {
//     try {
//       const deviceInfo = device.device.getDeviceInfo();
//       callback(finishLedgerDeviceInfo({
//         enabled: true,
//         error: false,
//         message: `Ledger Device Found.`,
//         deviceInfo: deviceInfo
//       }));
//     } catch (error) {
//       callback(finishLedgerDeviceInfo({
//         enabled: false,
//         error: true,
//         message: error.message,
//       }));
//     } finally {
//       device.close();
//     }
//   };
//   const deviceErrorCallback = (error) => {
//     callback(finishLedgerDeviceInfo(error));
//   };
//   getLedgerInfo(transport, deviceThenCallback, deviceErrorCallback);
// };



// const splitMessageIntoChunks = (ledgerMessage) => {
//   const messages = [];
//   const bufferSize = 255 * 2;
//   let offset = 0;
//   while (offset < ledgerMessage.length) {
//     let chunk;
//     let p1;
//     if ((ledgerMessage.length - offset) > bufferSize) {
//       chunk = ledgerMessage.substring(offset, offset + bufferSize);
//     } else {
//       chunk = ledgerMessage.substring(offset);
//     }
//     if ((offset + chunk.length) == ledgerMessage.length) {
//       p1 = '80';
//     } else {
//       p1 = '00';
//     }

//     const chunkLength = chunk.length / 2;

//     let chunkLengthHex = chunkLength.toString(16);
//     while (chunkLengthHex.length < 2) {
//       chunkLengthHex = '0' + chunkLengthHex;
//     }

//     messages.push('8002' + p1 + '00' + chunkLengthHex + chunk);
//     offset += chunk.length;
//   }

//   return messages;
// };

// const decodeSignature = (response) => {
//   /* istanbul ignore if */
//   if (debug) {
//     console.log('decodeSignature', 'response', response);
//   }
//   // const d2h = (d) => {
//   //   let s = (+d).toString(16);
//   //   if (s.length < 2) {
//   //     s = '0' + s;
//   //   }
//   //   return s;
//   // };
//   /**
//    * https://stackoverflow.com/questions/25829939/specification-defining-ecdsa-signature-data
//    * <br>
//    * the signature is TLV encoded.
//    * the first byte is 30, the "signature" type<br>
//    * the second byte is the length (always 44)<br>
//    * the third byte is 02, the "number: type<br>
//    * the fourth byte is the length of R (always 20)<br>
//    * the byte after the encoded number is 02, the "number: type<br>
//    * the byte after is the length of S (always 20)<br>
//    * <p>
//    * eg:
//    * 304402200262675396fbcc768bf505c9dc05728fd98fd977810c547d1a10c7dd58d18802022069c9c4a38ee95b4f394e31a3dd6a63054f8265ff9fd2baf68a9c4c3aa8c5d47e9000
//    * is
//    * 30LL0220RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR0220SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
//    */

//   const rLenHex = response.substring(6, 8);
//   const rLen = parseInt(rLenHex, 16) * 2;
//   const rStart = 8;
//   const rEnd = rStart + rLen;

//   // while ((response.substring(rStart, rStart + 2) == '00') && ((rEnd - rStart) > 64)) {
//   //   rStart += 2;
//   // }

//   // const r = response.substring(rStart, rEnd);
//   // console.log('r', r);

//   const sLenHex = response.substring(rEnd + 2, rEnd + 4);
//   const sLen = parseInt(sLenHex, 16) * 2;
//   const sStart = rEnd + 4;
//   const sEnd = sStart + sLen;

//   // while ((response.substring(sStart, sStart + 2) == '00') && ((sEnd - sStart) > 64)) {
//   // sStart += 2;
//   // }

//   // const s = response.substring(sStart, sEnd);

//   const signature = response.substring(0, sEnd);
//   /* istanbul ignore if */
//   if (debug) {
//     console.log('decodeSignature', 'signature', signature);
//   }
//   return signature;
//   // const b2 = d2h(r.length/2);
//   // const b3 = d2h(s.length/2);
//   // const suffix = `02${b2}${r}02${b3}${s}`;
//   // const b1 = d2h(suffix.length/2);
//   // // 0x30|b1|0x02|b2|r|0x02|b3|s
//   // // b1 = Length of remaining data
//   // // b2 = Length of r
//   // // b3 = Length of s
//   //
//   // const signatureHex = `30${b1}${suffix}`;
//   // return signatureHex;

//   // 30 45 02 20 60320ec6eceae31851a0f39b4a97f2ca6547b4fe3009e8b833f0878c623224ad 02 21 00fbdff032d1fe08065f68077f1d4094a48fd91f7baec26ce4c4d2cc54d5c2cef1
//   // 30 44 02 20 5520FD32B3C1D6D9FEA40A0D2084CC0FCDB0FE323C3958F045A7235F83B2F7EB 02 20 710F9F63F676BF5503695BE20DBBEBF556BDB2B28D06073516861DE65F9CA314

//   // const msgHashStart = sEnd + 4;
//   // const msgHashEnd = msgHashStart + 64;
//   // const msgHash = response.substring(msgHashStart, msgHashEnd);
//   //
//   // const SignerLength = 32;
//   // const SignatureLength = 64;
//   //
//   // let signatureHex =
//   // += r;
//   // while (signatureHex.length < SignerLength) {
//   //   signatureHex = '0' + signatureHex;
//   // }
//   //
//   // signatureHex += s;
//   //
//   // while (signatureHex.length < SignatureLength) {
//   //   signatureHex = '0' + signatureHex;
//   // }
//   //
//   // return signatureHex;
// };

// const sign = (transport, transactionHex, callback) => {
//   // transactionHex = '0200000000000000';
//   const transactionByteLength = Math.ceil(transactionHex.length / 2);
//   if (transactionByteLength > MAX_SIGNED_TX_LEN) {
//     callback({
//       success: false,
//       message: `Transaction length of ${transactionByteLength} bytes exceeds max length of ${MAX_SIGNED_TX_LEN} bytes. Send less candidates and consolidate utxos.`,
//     });
//     return;
//   }

//   const ledgerMessage = transactionHex + bip44Path;

//   const messages = splitMessageIntoChunks(ledgerMessage);

//   const deviceThenCallback = async (device) => {
//     // console.log('deviceThenCallback', 'device', device);
//     try {
//       let lastResponse = undefined;
//       // console.log('deviceThenCallback', 'messages', messages);
//       for (let ix = 0; ix < messages.length; ix++) {
//         const request = messages[ix];
//         /* istanbul ignore if */
//         if (debug) {
//           console.log('exchange', 'message', request);
//         }

//         const message = Buffer.from(request, 'hex');
//         const response = await device.exchange(message);
//         const responseStr = response.toString('hex').toUpperCase();
//         // console.log('exchange', 'request', request);
//         // console.log('exchange', 'response', responseStr);
//         /* istanbul ignore if */
//         if (debug) {
//           console.log('exchange', 'response', responseStr);
//         }

//         lastResponse = responseStr;
//       }
//       device.close();

//       let signature = undefined;
//       let success = false;
//       let message = lastResponse;
//       if (lastResponse !== undefined) {
//         if (lastResponse.endsWith('9000')) {
//           signature = decodeSignature(lastResponse);
//           success = true;
//         } else {
//           if (lastResponse == '6985') {
//             message += ' Tx Denied on Ledger';
//           }
//           if (lastResponse == '6D08') {
//             message += ' Tx Too Large for Ledger';
//           }
//           if (lastResponse == '6D33') {
//             message += ' Tx Too Large for Ledger Hash';
//           }
//           if (lastResponse == '6D34') {
//             message += ' Tx Too Large for Ledger Hash';
//           }
//           if (lastResponse == '6D35') {
//             message += ' Tx Too Large for Ledger Hash';
//           }
//           if (lastResponse == '6D06') {
//             message += ' Tx Decoding Buffer Underflow';
//           }
//         }
//       }

//       callback({
//         success: success,
//         message: message,
//         signature: signature,
//       });
//     } catch (error) {
//       callback({
//         success: false,
//         message: error.message,
//       });
//     }
//   };
//   const deviceErrorCallback = (error) => {
//     error.success = false;
//     callback(error);
//   };
//   getLedgerInfo(transport, deviceThenCallback, deviceErrorCallback);
// };

// export default {
//   getLedgerDeviceInfo,
//   getPublicKey,
//   sign
// };