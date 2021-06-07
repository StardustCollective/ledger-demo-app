import React, { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import { createMuiTheme, withStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import LockOpen from '@material-ui/icons/LockOpen';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CircularProgress , { CircularProgressProps }from '@material-ui/core/CircularProgress';
import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress';
import webHidTransport from '@ledgerhq/hw-transport-webhid';
import Box from '@material-ui/core/Box';
// import webUsbTransport from '@ledgerhq/hw-transport-webusb';
import Dag from './modules/hw-app-dag';
import logo from './logo.png';
import './App.css';

const ALERT_MESSAGES = {
  CONNECTION_CANCELED: 'Connection Canceled: Please connect to unlock wallet with Ledger.',
}

const ALERT_SEVERITY = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
}

enum WALLET_STATE_ENUM {
  LOCKED = 1,
  FETCHING,
  VIEW_ACCOUNTS,
  VIEW_ACCOUNT_ACTIVITY,
  SENDING,
}
interface DAG_ACCOUNT {
  address: String,
  balance: Number,
}

const useStyles = makeStyles({
  root: {
    minWidth: 400,
  },
  content: {
    padding: 0,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  table: {
    minWidth: 650,
  },
});

const BlueButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText("#001a2e"),
    backgroundColor: "#001a2e",
    '&:hover': {
      backgroundColor: "#001a2e",
    },
  },
}))(Button);

function Header() {
  return (
    <div className="cardHeader">
      <div className="leftHeader">
        <img src={logo} width={150} height={38} />
      </div>
      <div className="rightHeader">
        Wallet
      </div>
    </div>
  );
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function App() {
  const classes = useStyles();

  const [walletState, setWalletState] = useState<WALLET_STATE_ENUM>(WALLET_STATE_ENUM.LOCKED);
  const [accountData, setAccountData] = useState<Array<DAG_ACCOUNT>>([]);
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<String>('');
  const [alertSeverity, setAlertSeverity] = useState<String>('');
  const [accountsLoadProgress, setAccountsLoadProgress] = useState<Number>(0);
  const bull = <span className={classes.bullet}>•</span>;
  let dag;


  const onProgressUpdate = (loadProgress: number) => {
    let progress = loadProgress * 100;
    setAccountsLoadProgress(progress);
  }

  const onConnectClick = async () => {

    try {
      setWalletState(WALLET_STATE_ENUM.FETCHING);

      let transport = await webHidTransport.request();
      // Close any existing connections
      transport.close()

      dag = new Dag(webHidTransport);

      // Get account data 
      const accountData = await dag.getAccounts(onProgressUpdate) as Array<DAG_ACCOUNT>;
      setAccountData(accountData);
      setWalletState(WALLET_STATE_ENUM.VIEW_ACCOUNTS);

    } catch (error) {
      // console.log(typeof error.message);
      if (error.message.includes('open')) {
        setAlertSeverity(ALERT_SEVERITY.ERROR);
        setAlertMessage(ALERT_MESSAGES.CONNECTION_CANCELED);
        setOpenAlert(true);
      }
      setWalletState(WALLET_STATE_ENUM.LOCKED);
    }

  }

  function ConnectView() {
    let dag: any;

    return (
      <CardContent>
        <CardActions>
          <BlueButton onClick={onConnectClick} className={"connectButton"} size="large" variant="contained" color="primary">
            <LockOpen />&nbsp;Unlock with Ledgers
          </BlueButton>
        </CardActions>
      </CardContent>
    );
  }


  function FetchingView() {



    function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
      return (
        <Box display="flex" alignItems="center">
          <Box width="83%" mr={1}>
            <LinearProgress variant="determinate" {...props} />
          </Box>
          <Box minWidth={35}>
            <Typography variant="body2" color="textSecondary">{`${Math.round(
              props.value,
            )}%`}</Typography>
          </Box>
        </Box>
      );
    }

    return (
      <div className="fetchingView">
        <Typography>Loading Accounts...</Typography>
        <LinearProgressWithLabel value={accountsLoadProgress} />
      </div>
    );

  }

  const AccountsView = () => {

    return (
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Account</TableCell>
              <TableCell align="left">Address</TableCell>
              <TableCell align="left">Balance</TableCell>
              <TableCell align="left"></TableCell>
              {/* <TableCell align="right">Protein&nbsp;(g)</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {accountData.map((item, itemKey) => (
              <TableRow key={itemKey}>
                <TableCell component="th" scope="row">
                  {itemKey + 1}
                </TableCell>
                <TableCell align="left">{item.address}</TableCell>
                <TableCell align="left">{item.balance}</TableCell>
                <TableCell align="left">View</TableCell>
                {/* <TableCell align="right">{row.protein}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );


  }

  const AlertSnackBar = (props:{openAlert: boolean, message: String, severity: String}) => {

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


  function RenderByWalletState(props: any) {

    if (props.walletState === WALLET_STATE_ENUM.LOCKED) {
      return (
        <>
          <ConnectView />
        </>
      );
    } else if (props.walletState === WALLET_STATE_ENUM.FETCHING) {
      return (
        <>
          <FetchingView />
        </>
      );
    } else if (props.walletState === WALLET_STATE_ENUM.VIEW_ACCOUNTS) {
      return (
        <>
          <AccountsView />
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
      {/* <Alert severity="error">This is an error message!</Alert>
      <Alert severity="warning">This is a warning message!</Alert>
      <Alert severity="info">This is an information message!</Alert>
      <Alert severity="success">This is a success message!</Alert> */}
    </div>
  );
}

export default App;
