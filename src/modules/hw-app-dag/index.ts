//////////////////////////
// Lib Imports
//////////////////////////

import LedgerLink from './libs/LedgerLink';

//////////////////////////
// Util Imports
//////////////////////////

import DagUtils from "./utils/dag.util";

//////////////////////////
// API Service Imports
//////////////////////////

import { addressService } from './api';
import {dag4} from '@stardust-collective/dag4';

//////////////////////////
// Interfaces
//////////////////////////

export interface IDAG_ACCOUNT_DATA {
  address: string;
  balance: string;
}

//////////////////////////
// Constants
//////////////////////////

// Errors
const NO_ACCOUNTS_FOUND_ERROR = 'Error: No accounts found';

//////////////////////////
// Class
//////////////////////////
class Dag {
  private ledgerLink: LedgerLink;

  constructor(transport: any) {
    this.ledgerLink = new LedgerLink(transport);
  }

  /**
   * Returns a signed transaction ready to be posted to the network.
   */
  signTransaction() {



  }

  /**
   * Takes a signed transaction and posts it to the network.
   */
  postTransaction() {}

  /**
   * Retrieves all accounts from the ledger and pings the DAG network for balances.
   * @param progressUpdateCallback
   * @returns DAG_ACCOUNT[] A array of dag account objects.
   */
  public async getAccountInfoForPublicKeys (ledgerAccounts: { publicKey: string}[]) {

    if (ledgerAccounts.length > 0) {
      let responseArray = [];
      for (let i = 0; i < ledgerAccounts.length; i++) {
        const publicKey = ledgerAccounts[i].publicKey;
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

  /**
   * Retrieves public keys from the ledger.
   * @param progressUpdateCallback
   */
  public getPublicKeys (progressUpdateCallback?: (progress: number) => void) {
    return this.ledgerLink.getPublicKeys(8, progressUpdateCallback);
  };
}

export default Dag;
