export function getAllPrice(arr) {
  let count = 0;
  let allProductPrice = 0;
  let allPrintPrice = 0;
  let allPrice = 0;
  const initialValue = 0;
  arr.forEach((element) => {
    count = element.attributes.size.reduce(
      (accumulator, currentValue) => accumulator + currentValue.qty,
      initialValue,
    );
    allProductPrice += element.attributes.price * count;
    const frontPrintPrice =
      element.print && element.print.front.file
        ? element.print.front.cartParams.price
        : 0;
    const backPrintPrice =
      element.print && element.print.back.file
        ? element.print.back.cartParams.price
        : 0;
    const lsleevePrintPrice =
      element.print && element.print.lsleeve.file
        ? element.print.lsleeve.cartParams.price
        : 0;
    const rsleevePrintPrice =
      element.print && element.print.rsleeve.file
        ? element.print.rsleeve.cartParams.price
        : 0;

    allPrintPrice +=
      (frontPrintPrice +
        backPrintPrice +
        lsleevePrintPrice +
        rsleevePrintPrice) *
      count;
  });
  allPrice += allProductPrice + allPrintPrice;
  return { product: allProductPrice, print: allPrintPrice, price: allPrice };
}

export const getPreviewArr = (obj) => {
  const { print, cart_item_id } = obj;

  const zzz = [];

  if (!print) return;

  if (print.front.file || print.front.text) {
    zzz.push({
      place: 'Принт на груди.',
      name: 'front_print',
      format: print.front.cartParams.format,
      price: print.front.cartParams.price,
      size: print.front.cartParams.size,
      preview: print.front_preview.preview,
      id: cart_item_id,
    });
  }

  if (print.back.file || print.back.text) {
    zzz.push({
      place: 'Принт на спине.',
      name: 'back_print',
      format: print.back.cartParams.format,
      price: print.back.cartParams.price,
      size: print.back.cartParams.size,
      preview: print.back_preview.preview,
      id: cart_item_id,
    });
  }

  if (print.lsleeve.file || print.lsleeve.text) {
    zzz.push({
      place: 'Принт на л. рукаве.',
      name: 'lsleeve_print',
      format: print.lsleeve.cartParams.format,
      price: print.lsleeve.cartParams.price,
      size: print.lsleeve.cartParams.size,
      preview: print.lsleeve_preview.preview,
      id: cart_item_id,
    });
  }

  if (print.rsleeve.file || print.rsleeve.text) {
    zzz.push({
      place: 'Принт на п. рукаве.',
      name: 'rsleeve_print',
      format: print.rsleeve.cartParams.format,
      price: print.rsleeve.cartParams.price,
      size: print.rsleeve.cartParams.size,
      preview: print.rsleeve_preview.preview,
      id: cart_item_id,
    });
  }

  return zzz;
};

export const getPrintPrice = (obj) => {
  const { print } = obj;

  const initialValue = 0;

  const productPriece = obj.attributes.size.reduce(
    (accumulator, currentValue) => accumulator + currentValue.qty,
    initialValue,
  );

  let totalPrintSum = 0;

  if (!print) return;

  if (print.front.file || print.front.text) {
    totalPrintSum += print.front.cartParams.price * productPriece;
  }

  if (print.back.file || print.back.text) {
    totalPrintSum += print.back.cartParams.price * productPriece;
  }

  if (print.lsleeve.file || print.lsleeve.text) {
    totalPrintSum += print.lsleeve.cartParams.price * productPriece;
  }

  if (print.rsleeve.file || print.rsleeve.text) {
    totalPrintSum += print.rsleeve.cartParams.price * productPriece;
  }

  return totalPrintSum;
};
