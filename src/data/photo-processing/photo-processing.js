const photoProcessing = (file) => {
  // Размер ф-ла, нужен для отображения загрузчика
  // const size = file.size ? file.size : 'NOT SUPPORTED';
  console.log(file);
  const type = file.type ? file.type : 'NOT SUPPORTED';
  if (type === 'image/png' || type === 'image/jpeg') {
    return file;
  }
  return false;
};

export default photoProcessing;
