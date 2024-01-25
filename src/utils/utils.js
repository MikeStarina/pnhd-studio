export const fileSelect = (
  activeView,
  front_file,
  back_file,
  lsleeve_file,
  rsleeve_file,
  badge_file,
) => {
  if (activeView === 'front' && front_file.file) {
    return { file: front_file, name: front_file.file.name };
  }
  if (activeView === 'back' && back_file.file) {
    return { file: back_file, name: back_file.file.name };
  }
  if (activeView === 'lsleeve' && lsleeve_file.file) {
    return { file: lsleeve_file, name: lsleeve_file.file.name };
  }
  if (activeView === 'rsleeve' && rsleeve_file.file) {
    return { file: rsleeve_file, name: rsleeve_file.file.name };
  }
  if (activeView === 'badge' && badge_file.file) {
    return { file: badge_file, name: badge_file.file.name };
  }

  return false;
};

export const textFileSelect = (
  activeView,
  front_file,
  back_file,
  lsleeve_file,
  rsleeve_file,
) => {
  if (activeView.includes('front') && front_file.text) {
    return front_file;
  }
  if (activeView.includes('back') && back_file.text) {
    return back_file;
  }
  if (activeView.includes('lsleeve') && lsleeve_file.text) {
    return lsleeve_file;
  }
  if (activeView.includes('rsleeve') && rsleeve_file.text) {
    return rsleeve_file;
  }
  return 'something wrong';
};

export const setTextCoordinates = (activeView) => {
  if (activeView.includes('front')) {
    return {
      openText: true,
      downText: false,
      setText: 'Введите текст',
      isDragging: false,
      setColor: '#00ff00',
      setSize: 30,
      fontFamily: 'monospace',
      x: 140,
      y: 100,
      width: 230,
      height: 30,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
  }
  if (activeView.includes('back')) {
    return {
      openText: true,
      downText: false,
      setText: 'Введите текст',
      isDragging: false,
      setColor: '#00ff00',
      setSize: 30,
      fontFamily: 'calibri',
      x: 140,
      y: 100,
      width: 230,
      height: 30,
      rotation: 0,
    };
  }
  if (activeView.includes('lsleeve')) {
    return {
      openText: true,
      downText: false,
      setText: 'Введите текст',
      isDragging: false,
      setColor: '#00ff00',
      setSize: 20,
      fontFamily: 'calibri',
      x: 230,
      y: 110,
      width: 80,
      height: 40,
      rotation: 0,
    };
  }
  if (activeView.includes('rsleeve')) {
    return {
      openText: true,
      downText: false,
      setText: 'Введите текст',
      isDragging: false,
      setColor: '#00ff00',
      setSize: 20,
      fontFamily: 'calibri',
      x: 190,
      y: 110,
      width: 80,
      height: 40,
      rotation: 0,
    };
  }
  return 'something wrong';
};

// Задает координаты появления ФИЛЬТРА для привью изображения,
// вызывается в файле editor-action (redux)
export const setFilterCoords = (activeView) => {
  if (activeView.includes('front')) {
    return {
      circleX: 250,
      circleY: 180,
      squareX: 190,
      squareY: 120,
      rotation: 0,
      widthShape: 120,
      heightShape: 120,
      positionX: 0,
      positionY: 0,
      openCircle: false,
      openSquare: false,
      openMask: false,
    };
  }
  if (activeView.includes('back')) {
    return {
      circleX: 250,
      circleY: 180,
      squareX: 190,
      squareY: 120,
      rotation: 0,
      widthShape: 120,
      heightShape: 120,
      positionX: 0,
      positionY: 0,
      openCircle: false,
      openSquare: false,
      openMask: false,
    };
  }
  if (activeView.includes('lsleeve')) {
    return {
      circleX: 270,
      circleY: 130,
      squareX: 250,
      squareY: 110,
      rotation: 0,
      widthShape: 40,
      heightShape: 40,
      positionX: 0,
      positionY: 0,
      openCircle: false,
      openSquare: false,
      openMask: false,
    };
  }
  if (activeView.includes('rsleeve')) {
    return {
      circleX: 230,
      circleY: 130,
      squareX: 210,
      squareY: 110,
      rotation: 0,
      widthShape: 40,
      heightShape: 40,
      positionX: 0,
      positionY: 0,
      openCircle: false,
      openSquare: false,
      openMask: false,
    };
  }
  return 'something wrong';
};

// Задает координаты появления привью изображения, вызывается в файле editor-action (redux)
export const setCoords = (currentImage, activeView, itemType) => {
  let imageCoords = {
    x: 125,
    y: 100,
    width: 220,
    height: 300,
    rotation: 0,
  };

  if (activeView === 'front' || activeView === 'back') {
    if (currentImage.width >= currentImage.height) {
      const proportion = currentImage.width / currentImage.height;
      const displayWidth = 200;
      const displayHeight = displayWidth / proportion;

      imageCoords = {
        x: 150,
        y: itemType === 'hoodie' ? 130 : itemType === 'totebag' ? 190 : itemType === 'longsleeve' ? 130 : 100,
        width: displayWidth,
        height: displayHeight,
        rotation: 0,
      };
    } else {
      const proportion = currentImage.width / currentImage.height;
      const displayHeight = 200;
      const displayWidth = displayHeight * proportion;
      const xCoord = (220 - displayWidth) / 2;

      imageCoords = {
        x: 140 + xCoord,
        y: itemType === 'hoodie' ? 130 : itemType === 'totebag' ? 190 : itemType === 'longsleeve' ? 130 : 100,
        width: displayWidth,
        height: displayHeight,
        rotation: 0,
      };
    }
  } else if (activeView === 'lsleeve') {
    if (currentImage.width >= currentImage.height) {
      const proportion = currentImage.width / currentImage.height;
      const displayWidth = itemType === 'hoodie' ? 50 : 80;
      const displayHeight = displayWidth / proportion;

      imageCoords = {
        x: 230,
        y: itemType === 'hoodie' ? 125 : 105,
        width: displayWidth,
        height: displayHeight,
        rotation: 0,
      };
    } else {
      const proportion = currentImage.width / currentImage.height;
      const displayHeight = 80;
      const displayWidth = displayHeight * proportion;
      const xCoord = (90 - displayWidth) / 2;

      imageCoords = {
        x: itemType === 'hoodie' ? 230 : 230 + xCoord,
        y: itemType === 'hoodie' ? 125 : 105,
        width: displayWidth,
        height: displayHeight,
        rotation: 0,
      };
    }
  } else if (activeView === 'rsleeve') {
    if (currentImage.width >= currentImage.height) {
      const proportion = currentImage.width / currentImage.height;
      const displayWidth = itemType === 'hoodie' ? 50 : 80;
      const displayHeight = displayWidth / proportion;

      imageCoords = {
        x: itemType === 'hoodie' ? 215 : 190,
        y: itemType === 'hoodie' ? 125 : 105,
        width: displayWidth,
        height: displayHeight,
        rotation: 0,
      };
    } else {
      const proportion = currentImage.width / currentImage.height;
      const displayHeight = 80;
      const displayWidth = displayHeight * proportion;
      const xCoord = (90 - displayWidth) / 2;

      imageCoords = {
        x: itemType === 'hoodie' ? 215 : 190 + xCoord,
        y: itemType === 'hoodie' ? 125 : 105,
        width: displayWidth,
        height: displayHeight,
        rotation: 0,
      };
    }
  }

  return imageCoords;
};

export const checkResponse = (res) => {
  if (res.ok || res.created) {
    return res.json();
  }
  return res.json().then((err) => Promise.reject(err));
};

export const getString = (separator, arr) => {
  let string = '';
  if (arr.length !== 0) {
    string += separator;
    arr.forEach((elem, index) => {
      if (arr.length - 1 === 0) {
        string += `${elem}&`;
        return;
      }
      if (index === 0 && arr.length - 1 !== 0) {
        string += elem;
      }
      if (index > 0 && index !== arr.length - 1) {
        string += `,${elem}`;
      }
      if (index === arr.length - 1) {
        string += `,${elem}&`;
      }
    });
  }
  return string;
};
