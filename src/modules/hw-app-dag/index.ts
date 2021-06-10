//////////////////////////
// Lib Imports
//////////////////////////

import LedgerLink from "./libs/ledgerLink";
import addressTranscode from "./libs/transcode/addressTranscode";

//////////////////////////
// Util Imports
//////////////////////////

import DagUtils from "./utils/dag.util";

//////////////////////////
// API Service Imports
//////////////////////////

import { addressService } from "./api";

//////////////////////////
// Interfaces
//////////////////////////

export interface IDAG_ACCOUNT_DATA {
  address: string;
  balance: string;
}

export interface IPUBLIC_KEY_DATA{
  publicKey: string;
  message?: string;
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
   * 
   * @param publicKeysArray An array of public key data.
   */
  public getAccountInfoForPublicKeys = async(publicKeysArray: Array<IPUBLIC_KEY_DATA>) => {
    let accountInfoArray: Array<IDAG_ACCOUNT_DATA> = [];
    for (let i = 0; i < publicKeysArray.length; i++) {
      const publicKey = publicKeysArray[i].publicKey;
      const address = addressTranscode.getAddressFromRawPublicKey(publicKey);
      let response = await addressService.get(address);
      if (response === null) {
        response = {
          address,
          balance: 0.0,
        };
      } else {
        response.address = address;
        response.balance = DagUtils.balanceToWholeNumber(response.balance, 2);
      }
      accountInfoArray.push(response);
    }
    return accountInfoArray;
  }

  /**
   * Retrieves all accounts from the ledger and pings the DAG network for balances.
   * @param progressUpdateCallback
   * @returns Array<DAG_ACCOUNT> A array of dag account objects.
   */
  public getPublicKeys = async (progressUpdateCallback?: Function): Promise<Array<IPUBLIC_KEY_DATA>> => {
    return new Promise((resolve, reject) => {
      const callback = async (publicKeysArray: Array<IPUBLIC_KEY_DATA>) => {
        if (publicKeysArray.length > 0) {
          resolve(publicKeysArray);
        } else {
          reject(Error(NO_ACCOUNTS_FOUND_ERROR));
        }
      };
      this.ledgerLink.getPublicKeys(
        callback,
        progressUpdateCallback
      );
    });
  };
}

export default Dag;
