/////////////////////////
// Module Imports
/////////////////////////

import React from 'react';
import { withStyles } from '@material-ui/core/styles'

/////////////////////////
// Components Imports
/////////////////////////

import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';

/////////////////////////
// Icons Imports
/////////////////////////

import LockOpen from '@material-ui/icons/LockOpen';

/////////////////////////
// Styles Imports
/////////////////////////

import styles from './connect.module.scss';

/////////////////////////
// Constants
/////////////////////////

// Properties
const BUTTON_SIZE_PROP = 'large';
const BUTTON_VARIANT_PROP = 'contained';
const BUTTON_COLOR_PROP = 'primary';
const BUTTON_CUSTOM_COLOR_PROP = '#001a2e';

/////////////////////////
// Interface
/////////////////////////

interface IConnectProps {
  onConnectClick: React.MouseEventHandler<HTMLButtonElement>
}

/////////////////////////
// Component
/////////////////////////

function Connect(props: IConnectProps) {


  /////////////////////////
  // Callbacks
  /////////////////////////

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    if(props.onConnectClick){
      props.onConnectClick(event);
    }

  };

  /////////////////////////
  // Renders
  /////////////////////////

  const BlueButton = withStyles((theme) => ({
    root: {
      color: theme.palette.getContrastText(BUTTON_CUSTOM_COLOR_PROP),
      backgroundColor: BUTTON_CUSTOM_COLOR_PROP,
      '&:hover': {
        backgroundColor: BUTTON_CUSTOM_COLOR_PROP,
      },
    },
  }))(Button);

  return (
    <CardContent>
      <CardActions>
        <BlueButton 
          onClick={onClick} 
          className={styles.button} 
          size={BUTTON_SIZE_PROP} 
          variant={BUTTON_VARIANT_PROP} 
          color={BUTTON_COLOR_PROP}>
          <LockOpen />&nbsp;Unlock with Ledger
        </BlueButton>
      </CardActions>
    </CardContent>
  );
}

export default Connect;
