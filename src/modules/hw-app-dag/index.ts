//////////////////////////
// Lib Imports
//////////////////////////

import LedgerLink from './libs/LedgerLink';

//////////////////////////
// Util Imports
//////////////////////////

import DagUtils from './utils/dag.util';

//////////////////////////
// API Service Imports
//////////////////////////

import { addressService } from './api';
import {dag4} from '@stardust-collective/dag4';

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

  public async getAccounts (progressUpdateCallback?: (progress: number) => void) {

    const messagesArray = await this.ledgerLink.getPublicKeysForAllAccounts(8, progressUpdateCallback);

    if (messagesArray.length > 0) {
      let responseArray = [];
      for (let i = 0; i < messagesArray.length; i++) {
        const publicKey = messagesArray[i].publicKey;
        console.log('public', publicKey);
        const address = dag4.keyStore.getDagAddressFromPublicKey(publicKey);
        let response = await addressService.get(address);
        if (response === null) {
          response = {
            address,
            balance: 0.00,
          };
        } else {
          response.address = address;
          response.balance = DagUtils.balanceToWholeNumber(response.balance, 2);
        }
        responseArray.push(response);
      }
      return responseArray;
    } else {
      throw new Error('No accounts found');
    }
  }
}

export default Dag;


