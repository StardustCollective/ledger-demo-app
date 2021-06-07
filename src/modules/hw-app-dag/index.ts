//////////////////////////
// Lib Imports
//////////////////////////

import LedgerLink from './libs/LedgerLink';
import addressTranscode from './libs/addressTranscode';

//////////////////////////
// API Service Imports
//////////////////////////

import { addressService } from './api';

//////////////////////////
// API Services
//////////////////////////

class Dag {

  private ledgerLink: LedgerLink;

  constructor(transport: any) {
    this.ledgerLink = new LedgerLink(transport);
  }

  getBalanceForAddress() {

  }

  public getAccounts = async (progressUpdateCallback?: Function) => {
    return new Promise((resolve, reject) => {
      const callback = async (messagesArray: any) => {
        /* istanbul ignore if */
        if (messagesArray.length > 0) {
          let responseArray = [];
          for(let i = 0; i < messagesArray.length; i++) {
            const publicKey = messagesArray[i].publicKey;
            const address = addressTranscode.getAddressFromRawPublicKey(publicKey);
            let response = await addressService.get(address);
            if(response === null){
              response = {
                address,
                balance: 0,
              };
            }else {
              response.address = address;
            }
            responseArray.push(response);
          }
          resolve(responseArray);
        } else {
          reject(Error(messagesArray.message));
        }
      };
      this.ledgerLink.getPublicKeysForAllAccounts(callback, progressUpdateCallback);
    });
  }; 
}

export default Dag;


