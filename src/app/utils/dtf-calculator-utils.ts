



export const dtfCalculatorFunc = (params: {width: string, height: string, qty: string}) => {

    const width = parseInt(params.width) + 1;
    const height = parseInt(params.height) + 1;
    const qty = parseInt(params.qty);
    const dtfWidth = 50; //ширина dtf пленки


    const result = {
        filmLength: '',
        printPrice: '',
        transferPrice: '',
        totalPrice: '',
        printSize: '',
        printOrientation: '',
        qty: '',
    }
    


    

    if (width && height && qty) {

        if (width <= dtfWidth && width <= height) {
            const printToWidth = Math.floor(dtfWidth / width);

            const orderHeight = Math.ceil(qty / printToWidth) * height;
            const orderHeightInMeters = orderHeight / 100;

            
            if (orderHeightInMeters <= 10) {

                const filmPrice = Math.ceil(orderHeightInMeters) * 2000;
                const printPrice = qty * 150;
                const totalPrice = filmPrice + printPrice;
                //console.log(totalPrice);

       

                result.filmLength = `Длинна пленки: ${orderHeightInMeters} м.`;
                result.printPrice = `Стоимость печати: ${filmPrice} р.`;
                result.transferPrice = `Стоимость переноса: ${printPrice} р.`;
                result.totalPrice = `${totalPrice} р.`;

                result.printSize = `Размер: ШхВ ${width - 1} х ${height - 1} см.`;
                result.printOrientation = `Раскладка: по ширине`;
                result.qty = `Количество: ${qty}  шт.`;

                //error.textContent = '';

            } else {

                const filmPrice = Math.ceil(orderHeightInMeters) * 1500;
                const printPrice = qty * 150;
                const totalPrice = filmPrice + printPrice;
                //console.log(totalPrice);

                
              

                result.filmLength = `Длинна пленки: ${orderHeightInMeters} м.`;
                result.printPrice = `Стоимость печати: ${filmPrice} р.`;
                result.transferPrice = `Стоимость переноса: ${printPrice} р.`;
                result.totalPrice = `${totalPrice} р.`;

                result.printSize = `Размер: ШхВ ${width - 1} х ${height - 1} см.`;
                result.printOrientation = `Раскладка: по ширине`;
                result.qty = `Количество: ${qty}  шт.`;

                //error.textContent = '';

            }

        } else if (width <= dtfWidth && width > height || width > dtfWidth && height <= dtfWidth) {
            const printToWidth = Math.floor(dtfWidth / height);

            const orderHeight = Math.ceil(qty / printToWidth) * width;
            const orderHeightInMeters = orderHeight / 100;

            if (orderHeightInMeters <= 10) {

                const filmPrice = Math.ceil(orderHeightInMeters) * 2000;
                const printPrice = qty * 150;
                const totalPrice = filmPrice + printPrice;
                //console.log(totalPrice);

                
                
                result.filmLength = `Длинна пленки: ${orderHeightInMeters} м.`;
                result.printPrice = `Стоимость печати: ${filmPrice} р.`;
                result.transferPrice = `Стоимость переноса: ${printPrice} р.`;
                result.totalPrice = `${totalPrice} р.`;

                result.printSize = `Размер: ШхВ ${width - 1} х ${height - 1} см.`;
                result.printOrientation = `Раскладка: по ширине`;
                result.qty = `Количество: ${qty}  шт.`;

                //error.textContent = '';


            } else {

                const filmPrice = Math.ceil(orderHeightInMeters) * 1500;
                const printPrice = qty * 150;
                const totalPrice = filmPrice + printPrice;
                //console.log(totalPrice);

                
              

                result.filmLength = `Длинна пленки: ${orderHeightInMeters} м.`;
                result.printPrice = `Стоимость печати: ${filmPrice} р.`;
                result.transferPrice = `Стоимость переноса: ${printPrice} р.`;
                result.totalPrice = `${totalPrice} р.`;

                result.printSize = `Размер: ШхВ ${width - 1} х ${height - 1} см.`;
                result.printOrientation = `Раскладка: по ширине`;
                result.qty = `Количество: ${qty}  шт.`;

                //error.textContent = '';

            }

        } else {
          
                //error.textContent = 'принт больше области печати';
           
                result.filmLength = `м.`;
                result.printPrice = `Стоимость печати:  р.`;
                result.transferPrice = `Стоимость переноса:  р.`;
                result.totalPrice = `Итоговая стоимость:  р.`;

                result.printSize = `Размер: ШхВ ${width - 1} х ${height - 1} см.`;
                result.printOrientation = `Раскладка: по ширине`;
                result.qty = `Количество: ${qty}  шт.`;
        }

    } else {
        //error.textContent = 'параметры не указаны';
     
        

        result.filmLength = `м.`;
        result.printPrice = `Стоимость печати:  р.`;
        result.transferPrice = `Стоимость переноса:  р.`;
        result.totalPrice = `Итоговая стоимость:  р.`;

        result.printSize = `Размер: ШхВ ${width - 1} х ${height - 1} см.`;
        result.printOrientation = `Раскладка: по ширине`;
        result.qty = `Количество: ${qty}  шт.`;

    }

    return result;

}