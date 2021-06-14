/////////////////////////
// Image Imports
/////////////////////////

import logo from './../../logo.png';

/////////////////////////
// Styles
/////////////////////////

import styles from './styles.module.scss';

/////////////////////////
// Constants
/////////////////////////

// Numbers
const LOGO_IMAGE_WIDTH_NUMBER = 150;
const LOGO_IMAGE_HEIGHT_NUMBER = 38;
// Strings
const WALLET_RIGHT_HEADER_STRING = 'Wallet';

/////////////////////////
// Component
/////////////////////////

const Header = () => {

  /////////////////////////
  // Render
  /////////////////////////

  return (
    <div className={styles.cardHeader}>
      <div className={styles.leftHeader}>
        <img src={logo} 
          width={LOGO_IMAGE_WIDTH_NUMBER} 
          height={LOGO_IMAGE_HEIGHT_NUMBER} 
        />
      </div>
      <div className={styles.rightHeader}>
        {WALLET_RIGHT_HEADER_STRING}
      </div>
    </div>
  );    

}

export default Header;