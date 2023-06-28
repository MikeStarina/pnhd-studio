export const photoProcessing = (file) => {
    // console.log(file, '<<all');

    // Размер ф-ла, нужен для отображения загрузчика
    // const size = file.size ? file.size : 'NOT SUPPORTED';

    const type = file.type ? file.type : 'NOT SUPPORTED';
    if (type === 'image/png' || type === 'image/jpeg') {
        console.log(type, '<<type');
        return file;
    }
};
