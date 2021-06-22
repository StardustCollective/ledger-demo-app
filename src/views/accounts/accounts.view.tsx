/////////////////////////
// Module Imports
/////////////////////////

import styles from "./index.module.scss";
import CallMadeIcon from "@material-ui/icons/CallMade";
import { Checkbox } from "@material-ui/core";

/////////////////////////
// Components Imports
/////////////////////////

import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import React from "react";
import { LedgerAccount } from "@stardust-collective/dag4-ledger";
import { ellipsis } from "../../helper";

/////////////////////////
// Styles
/////////////////////////

/////////////////////////
// Interfaces
/////////////////////////
interface IAccountsProps {
  onTxClick: (index: number) => void;
  accountData: LedgerAccount[];
}

/////////////////////////
// Constants
/////////////////////////

// Strings
// const TABLE_HEADER_STRINGS = {
//   ACCOUNT: "Account",
//   ADDRESS: "Address",
//   BALANCE: "Balance",
// };
// const GENERATE_TRANSACTION_LINK_STRING = "Generate Transaction";

/////////////////////////
// View
/////////////////////////

let Accounts = (props: IAccountsProps) => {
  let { accountData } = props;

  const onGenerateClick = (index: number) => {
    if (props.onTxClick) {
      props.onTxClick(index);
    }
  };

  /////////////////////////
  // Render
  /////////////////////////

  return (
    <TableContainer component={Paper} className={styles.paper}>
      <span>Please select an account:</span>
      <div className={styles.walletList}>
        <div className={styles.wallet}>
          <table>
            <tbody>
              {accountData.map((item, itemKey) => (
                <tr key={`wallet-${itemKey}`}>
                  <td>
                    <Checkbox color="primary" />
                  </td>
                  <td>{itemKey + 1}</td>
                  <td>{ellipsis(item.address)}</td>
                  <td>{item.balance} DAG</td>
                  <td
                    className={styles.expand}
                    onClick={() => onGenerateClick(itemKey)}
                  >
                    <CallMadeIcon />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.pagination}>
        <span className={styles.previous}>Previous</span>
        <span>Next</span>
      </div>
    </TableContainer>
  );
};

export default Accounts;
