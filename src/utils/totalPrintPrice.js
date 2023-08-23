const totalPrintPrice = (front_file, back_file, lsleeve_file, rsleeve_file, badge_file) => {
  let totalPrintPrice = 0;
  totalPrintPrice = front_file.cartParams ? totalPrintPrice + front_file.cartParams.price : totalPrintPrice;
  totalPrintPrice = back_file.cartParams ? totalPrintPrice + back_file.cartParams.price : totalPrintPrice;
  totalPrintPrice = lsleeve_file.cartParams ? totalPrintPrice + lsleeve_file.cartParams.price : totalPrintPrice;
  totalPrintPrice = rsleeve_file.cartParams ? totalPrintPrice + rsleeve_file.cartParams.price : totalPrintPrice;
  totalPrintPrice = badge_file.cartParams ? totalPrintPrice + badge_file.cartParams.price : totalPrintPrice;
  return totalPrintPrice;
};

export default totalPrintPrice;
