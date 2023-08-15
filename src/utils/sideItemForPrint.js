const sideItemForPrint = (item, activeView) => {
  let initialParams = {
    x: 140,
    y: 100,
    width: 220,
    height: 300,
  };

  if (activeView === 'back') {
    if (item.type === 'hoodie') {
      initialParams = {
        x: 150,
        y: 140,
        width: 200,
        height: 290,
      };
    } else if (item.type === 'totebag') {
      initialParams = {
        x: 150,
        y: 190,
        width: 200,
        height: 220,
      };
    } else {
      initialParams = {
        x: 140,
        y: 100,
        width: 220,
        height: 300,
      };
    }
  } else if (activeView === 'front' && item.type === 'hoodie') {
    initialParams = {
      x: 150,
      y: 130,
      width: 200,
      height: 200,
    };
  } else if (activeView === 'front' && item.type === 'longsleeve') {
    initialParams = {
      x: 150,
      y: 130,
      width: 200,
      height: 270,
    };
  } else if (item.type === 'totebag' && activeView === 'front') {
    initialParams = {
      x: 150,
      y: 190,
      width: 200,
      height: 220,
    };
  } else if (activeView === 'lsleeve') {
    if (item.type === 'hoodie' || item.type === 'longsleeve' || item.type === 'sweatshirt') {
      initialParams = {
        x: 230,
        y: 125,
        width: 55,
        height: 200,
      };
    } else {
      initialParams = {
        x: 230,
        y: 105,
        width: 80,
        height: 90,
      };
    }
  } else if (activeView === 'rsleeve') {
    if (item.type === 'hoodie' || item.type === 'longsleeve' || item.type === 'sweatshirt') {
      initialParams = {
        x: 215,
        y: 125,
        width: 55,
        height: 200,
      };
    } else {
      initialParams = {
        x: 190,
        y: 105,
        width: 80,
        height: 90,
      };
    }
  }
  return initialParams;
};

export default sideItemForPrint;
