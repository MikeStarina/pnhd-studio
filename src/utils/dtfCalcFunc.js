const dtfCalcFunc = (initWidth, initHeight, initQty) => {
  const width = parseInt(initWidth, 10) + 1;
  const height = parseInt(initHeight, 10) + 1;
  const qty = parseInt(initQty, 10);

  const dtfWidth = 50;

  const result = {
    printSize: '',
    printOrientation: '',
    filmPrice: 0,
    printPrice: 0,
    totalPrice: 0,
    filmTotalLength: 0,
    error: '',
  };

  if (width && height && qty) {
    if (width <= dtfWidth && width <= height) { // eslint-disable-line
      const printToWidth = Math.floor(dtfWidth / width);

      const orderHeight = Math.ceil(qty / printToWidth) * height;
      const orderHeightInMeters = orderHeight / 100;

      if (orderHeightInMeters <= 10) {
        const filmPrice = Math.ceil(orderHeightInMeters) * 2000;
        const printPrice = qty * 150;
        const totalPrice = filmPrice + printPrice;
        // console.log(totalPrice);

        result.filmTotalLength = orderHeightInMeters;
        result.filmPrice = filmPrice;
        result.printPrice = printPrice;
        result.totalPrice = totalPrice;
        result.printSize = `ШхВ ${width - 1} х ${height - 1} см.`;
        result.printOrientation = 'по ширине';
      } else {
        const filmPrice = Math.ceil(orderHeightInMeters) * 1500;
        const printPrice = qty * 150;
        const totalPrice = filmPrice + printPrice;
        // console.log(totalPrice);

        result.filmTotalLength = orderHeightInMeters;
        result.filmPrice = filmPrice;
        result.printPrice = printPrice;
        result.totalPrice = totalPrice;
        result.printSize = `ШхВ ${width - 1} х ${height - 1} см.`;
        result.printOrientation = 'по ширине';
      }
    } else if (width <= dtfWidth && width > height || width > dtfWidth && height <= dtfWidth) { // eslint-disable-line
      const printToWidth = Math.floor(dtfWidth / height);

      const orderHeight = Math.ceil(qty / printToWidth) * width;
      const orderHeightInMeters = orderHeight / 100;

      if (orderHeightInMeters <= 10) {
        const filmPrice = Math.ceil(orderHeightInMeters) * 2000;
        const printPrice = qty * 150;
        const totalPrice = filmPrice + printPrice;
        // console.log(totalPrice);

        result.filmTotalLength = orderHeightInMeters;
        result.filmPrice = filmPrice;
        result.printPrice = printPrice;
        result.totalPrice = totalPrice;
        result.printSize = `ШхВ ${width - 1} х ${height - 1} см.`;
        result.printOrientation = 'по высоте';
      } else {
        const filmPrice = Math.ceil(orderHeightInMeters) * 1500;
        const printPrice = qty * 150;
        const totalPrice = filmPrice + printPrice;
        // console.log(totalPrice);

        result.filmTotalLength = orderHeightInMeters;
        result.filmPrice = filmPrice;
        result.printPrice = printPrice;
        result.totalPrice = totalPrice;
        result.printSize = `ШхВ ${width - 1} х ${height - 1} см.`;
        result.printOrientation = 'по высоте';
      }
    } else {
      result.error = 'принт больше области печати';
      result.filmTotalLength = 0;
      result.filmPrice = 0;
      result.printPrice = 0;
      result.totalPrice = 0;
      result.printSize = '';
      result.printOrientation = '';
    }
  } else {
    result.error = 'параметры не указаны';
    result.filmTotalLength = 0;
    result.filmPrice = 0;
    result.printPrice = 0;
    result.totalPrice = 0;
    result.printSize = '';
    result.printOrientation = '';
  }

  return result;
};

export default dtfCalcFunc;
