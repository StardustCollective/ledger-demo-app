import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles'

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import webHidTransport from '@ledgerhq/hw-transport-webhid';
import Dag from './modules/hw-app-dag';
import logo from './logo.png';
import './App.css';

/////////////////////////
// View Imports
/////////////////////////

import ConnectView from './views/connect';
import FetchingProgressView from './views/fetchingProgress';
import AccountsView from './views/accounts';

/////////////////////////
// Interface Imports
/////////////////////////

import { DAG_ACCOUNT } from './interfaces';

/////////////////////////
// Constants
/////////////////////////

// Strings
const CONNECTION_CANCELED_ERROR_STRING = 'Cannot read property';
const LEDGER_APP_CLOSED_ERROR_STRING = '6E01';
const ALERT_MESSAGES_STRINGS = {
  CONNECTION_CANCELED: 'Connection Canceled: Please connect to unlock wallet with Ledger.',
  OPEN_CONSTELLATION_APP: 'Open App: Please open the Constellation App on your Ledger',
}
// States
const ALERT_SEVERITY_STATE = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
}

/////////////////////////
// ENUMS
/////////////////////////

enum WALLET_STATE_ENUM {
  LOCKED = 1,
  FETCHING,
  VIEW_ACCOUNTS,
  VIEW_ACCOUNT_ACTIVITY,
  SENDING,
}

/////////////////////////
// Interfaces
/////////////////////////

interface IRenderStateProp  {
  walletState: WALLET_STATE_ENUM;
}


/////////////////////////
// Style Hooks
/////////////////////////

const useStyles = makeStyles({
  root: {
    minWidth: 400,
  },
});

function Header() {
  return (
    <div className='cardHeader'>
      <div className='leftHeader'>
        <img src={logo} width={150} height={38} />
      </div>
      <div className='rightHeader'>
        Wallet
      </div>
    </div>
  );
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant='filled' {...props} />;
}

function App() {

  let dag;

  /////////////////////////
  // Hooks
  /////////////////////////

  const classes = useStyles();
  const [walletState, setWalletState] = useState<WALLET_STATE_ENUM>(WALLET_STATE_ENUM.LOCKED);
  const [accountData, setAccountData] = useState<Array<DAG_ACCOUNT>>([]);
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<String>('');
  const [alertSeverity, setAlertSeverity] = useState<String>('');
  const [accountsLoadProgress, setAccountsLoadProgress] = useState<number>(0);
  
  /////////////////////////
  // Callbacks
  /////////////////////////

  const onProgressUpdate = (loadProgress: number) => {
    let progress = loadProgress * 100;
    setAccountsLoadProgress(progress);
  }

  const onConnectClick = async () => {
    let transport;
    try {
      // Close any open alerts
      setOpenAlert(false);
      // Update the wallet state
      setWalletState(WALLET_STATE_ENUM.FETCHING);
      // Prompt for USB permissions
      transport = await webHidTransport.request();
      // Close any existing connections
      transport.close()
      // Set the transport 
      dag = new Dag(webHidTransport);
      // Get account data for ledger
      const accountData = await dag.getAccounts(onProgressUpdate) as Array<DAG_ACCOUNT>;
      setAccountData(accountData);
      setWalletState(WALLET_STATE_ENUM.VIEW_ACCOUNTS);

    } catch (error) {;
      if (error.message.includes(CONNECTION_CANCELED_ERROR_STRING)) {
        setAlertSeverity(ALERT_SEVERITY_STATE.ERROR);
        setAlertMessage(ALERT_MESSAGES_STRINGS.CONNECTION_CANCELED);
        setOpenAlert(true);
      } else if (error.message.includes(LEDGER_APP_CLOSED_ERROR_STRING)){
        setAlertSeverity(ALERT_SEVERITY_STATE.ERROR);
        setAlertMessage(ALERT_MESSAGES_STRINGS.OPEN_CONSTELLATION_APP);
        setOpenAlert(true);
      } 
      setWalletState(WALLET_STATE_ENUM.LOCKED);
    }

  }


  const AlertSnackBar = (props:{openAlert: boolean, message: String, severity: undefined}) => {

    const onClose = () => {
      setOpenAlert(false)
    }

    return (
      <>
        <Snackbar open={props.openAlert} autoHideDuration={6000} onClose={onClose}>
          <Alert onClose={onClose} severity={props.severity}>
            {props.message}
          </Alert>
        </Snackbar>
      </>
    );

  }

  /////////////////////////
  // Renders
  /////////////////////////

  function RenderByWalletState(props: IRenderStateProp) {
    if (props.walletState === WALLET_STATE_ENUM.LOCKED) {
      return (
        <>
          <ConnectView onConnectClick={onConnectClick} />
        </>
      );
    } else if (props.walletState === WALLET_STATE_ENUM.FETCHING) {
      return (
        <>
          <FetchingProgressView accountsLoadProgress={accountsLoadProgress}/>
        </>
      );
    } else if (props.walletState === WALLET_STATE_ENUM.VIEW_ACCOUNTS) {
      return (
        <>
          <AccountsView  accountData={accountData} />
        </>
      );
    }
    return null;
  }


  return (
    <div className="App">
      <header className="App-header">
        <Card className={classes.root}>
          <Header />
          <RenderByWalletState walletState={walletState} />
        </Card>
      </header>
      <AlertSnackBar openAlert={openAlert} message={alertMessage} severity={alertSeverity} />
    </div>
  );
}

export default App;
