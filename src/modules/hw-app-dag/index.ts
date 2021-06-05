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

  public getAccounts = async () => {
    return new Promise((resolve, reject) => {
      const callback = async (messagesArray: any) => {
        /* istanbul ignore if */
        if (messagesArray.length > 0) {
          console.log(messagesArray);
          let responseArray = [];
          for(let i = 0; i < messagesArray.length; i++) {
            const publicKey = messagesArray[i].publicKey;
            const address = addressTranscode.getAddressFromRawPublicKey(publicKey);
            console.log("Public Key: " + publicKey);
            const response = await addressService.get(address);
            responseArray.push(response);
          }

          console.log(responseArray);
          // response.balanceWhole = toWholeNumber(response.balance);
          // response.address = address;
          // response.success = true;
          // const lastRefPath = `/transaction/last-ref/${address}`;
          // const lastRefResponse = await integrationUtil.get(config, lastRefPath);
          // response.lastRef = lastRefResponse;
          // resolve(response);
        } else {
          // normally we would reject here to throw an error.
          // but since we are returning a JSON object,
          // we return success:false with a message, instead of throwing an error.
          reject(Error(messagesArray.message));
          // resolve(messagesArray);
        }
      };
      this.ledgerLink.getPublicKeysForAllAccounts(callback);
    });
  }; 
}

export default Dag;


