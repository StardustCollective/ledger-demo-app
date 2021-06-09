/////////////////////////
// Component Imports
/////////////////////////

import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';

/////////////////////////
// Interfaces
/////////////////////////

interface IAlertBar {
  openAlert: boolean,
  message: String,
  severity: undefined,
  onClose: Function,
}

/////////////////////////
// Constants
/////////////////////////

// Props
const MUI_ALERT_ELEVATION_PROP = 6;
const MUI_ALERT_VARIANT_PROP = 'filled';
const SNACK_BAR_AUTO_HIDE_DURATION_PROP = 6000;

/////////////////////////
// Components
/////////////////////////

const AlertBar = (props: IAlertBar) => {

  /////////////////////////
  // Props
  /////////////////////////

  const {
    openAlert,
    message,
    severity,
    onClose,
  } = props;


  /////////////////////////
  // Callbacks
  /////////////////////////

  const onAlertClose = () => {
    if(onClose){
      onClose();
    }
  }

  /////////////////////////
  // Renders
  /////////////////////////

  function Alert(props: AlertProps) {
    return <MuiAlert elevation={MUI_ALERT_ELEVATION_PROP} variant={MUI_ALERT_VARIANT_PROP} {...props} />;
  }

  return (
    <>
      <Snackbar open={openAlert} autoHideDuration={SNACK_BAR_AUTO_HIDE_DURATION_PROP} onClose={onAlertClose}>
        <Alert onClose={onAlertClose} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );

}

export default AlertBar