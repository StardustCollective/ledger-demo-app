import React, { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import { createMuiTheme, withStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import LockOpen from '@material-ui/icons/LockOpen';
import Typography from '@material-ui/core/Typography';
import webUsbTransport from '@ledgerhq/hw-transport-webhid';
// import webUsbTransport from '@ledgerhq/hw-transport-webusb';
import Dag from './modules/hw-app-dag';
import logo from './logo.png';
import './App.css';


enum WALLET_STATE_ENUM {
  LOCKED = 1,
  ACCOUNTS,
  ACCOUNT_ACTIVITY,
  SENDING,
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

function ConnectView() {
  let dag: any;

  const onConnectClick = () => {
    console.log("Connect Clicked");
    try{
      webUsbTransport.request().then(transport => {
        transport.close()
        dag = new Dag(webUsbTransport);
        dag.getAccounts(); 
      });
    }catch (error){
      console.log(error);
    }

  }

  return (
    <CardContent>
      <CardActions>
        <BlueButton onClick={onConnectClick} className={"connectButton"} size="large" variant="contained" color="primary">
          <LockOpen />&nbsp;Unlock with Ledger
        </BlueButton>
      </CardActions>
    </CardContent>
  );
}
// { pretty }: { pretty: boolean }
function RenderByWalletState(props: any) {

  if (props.walletState === WALLET_STATE_ENUM.LOCKED) {
    return (
      <>
        <ConnectView />
      </>
    )
  }

  return null;

}

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

function App() {
  const classes = useStyles();

  const [walletState, setWalletState] = useState(WALLET_STATE_ENUM.LOCKED);
  const bull = <span className={classes.bullet}>•</span>;


  return (
    <div className="App">
      <header className="App-header">
        <Card className={classes.root}>
          <Header />
          <RenderByWalletState walletState={walletState} />
        </Card>
      </header>
    </div>
  );
}

export default App;
