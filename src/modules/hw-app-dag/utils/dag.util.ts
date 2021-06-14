/////////////////////////
// Class
/////////////////////////

class DagUtil {

  /////////////////////////
  // Static Methods
  /////////////////////////

  static leftPad(number: string, length: number) {
    let str = "" + number;
    while (str.length < length) {
      str = "0" + str;
    }
    return str;
  }

  static balanceToWholeNumber(balance: string, decimalPlaces: number = 8) {
    const paddedBalance = DagUtil.leftPad(balance, 9);
    const prefixLength = paddedBalance.length - 8;
    const prefix = paddedBalance.slice(0, prefixLength);
    const suffix = paddedBalance.slice(-(decimalPlaces));

    return `${prefix}.${suffix}`;
  }
}

export default DagUtil;
