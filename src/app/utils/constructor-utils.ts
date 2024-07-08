import { Ref } from "react";
import { IProduct } from "./types";
import { IPrintFile } from "./types";
import { IInitialPrintParams } from "./types";
import { IStageParams } from "./types";
import { v4 as uuidv4 } from 'uuid';
import { apiBaseUrl } from "./constants";
import * as THREE from 'three';
import { TParams } from "./types";

export const sideItemForPrint = (item: IProduct, activeView: string) => {
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


export const fileSelect = (
    activeView: string,
    front_file: IPrintFile,
    back_file: IPrintFile,
    lsleeve_file: IPrintFile,
    rsleeve_file: IPrintFile,
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
  
    return false;
};


export const photoProcessing = (file: any) => { //хз как типизировать файлы
  // Размер ф-ла, нужен для отображения загрузчика
  // const size = file.size ? file.size : 'NOT SUPPORTED';

  const type = file.type ? file.type : 'NOT SUPPORTED';
  if (type === 'image/png' || type === 'image/jpeg') {
    return file;
  }
  return false;
};

// считает стоимость печати
export const totalPrintPriceFunc = (
  front_file: IPrintFile | undefined,
  back_file: IPrintFile | undefined,
  lsleeve_file: IPrintFile | undefined,
  rsleeve_file: IPrintFile | undefined,
): number => {
  let totalPrintPrice = 0;
  totalPrintPrice = front_file && front_file.cartParams
    ? totalPrintPrice + front_file.cartParams.price
    : totalPrintPrice;
  totalPrintPrice = back_file && back_file.cartParams
    ? totalPrintPrice + back_file.cartParams.price
    : totalPrintPrice;
  totalPrintPrice = lsleeve_file && lsleeve_file.cartParams
    ? totalPrintPrice + lsleeve_file.cartParams.price
    : totalPrintPrice;
  totalPrintPrice = rsleeve_file && rsleeve_file.cartParams
    ? totalPrintPrice + rsleeve_file.cartParams.price
    : totalPrintPrice;
 
  return totalPrintPrice;
};




// считает начальные координаты загруженного изображения
export const setCoords = (currentImage: IInitialPrintParams, activeView: string, itemType: string): TParams => {


  let params = {
    
      url: currentImage.url ? `${apiBaseUrl}${currentImage.url}` : undefined,
      decalRotation: [0,0,0],
      //decalPosition: [0,0.1,0],
      decalPosition: [0,0.1,0.1],
      deltaX: 0.15,
      deltaY: 0.15 * (currentImage.height / currentImage.width),
      deltaZ: 0.4,
      decalScale: [0.15,0.15 * (currentImage.height / currentImage.width),0.4],
      pivotVisibility: false,
      pivotRotation: [0,0,0],
      //pivotPosition: [-0.075,-0.075,0.15],
      pivotPosition: [0,0.1,0.2],
      pivotScale: 0.15,
      dragAxis: [true, true, false],  
      meshRotation: [0,0,0], 
  };

  
  if (activeView === 'front') {
    const sizeDelta = currentImage.height / currentImage.width;
    //const pivotInitScale = sizeDelta <= 1 ? 0.15 : sizeDelta > 1 ? 0.15 * sizeDelta : 0.15;
    const deltaX = 0.15;    
    const deltaY = 0.15 * sizeDelta;
    let deltaZ = 0.2;


    if (itemType === 'tshirt') {  return {
          ...params,
          deltaX,
          deltaY,
          deltaZ,
          decalScale: [deltaX,deltaY,deltaZ],
          //pivotScale: pivotInitScale,
      };}
    if (itemType === 'longsleeve' || itemType === 'sweatshirt' || itemType === 'hoodie') {  return {
          ...params,
          deltaX,
          deltaY,
          deltaZ,
          decalScale: [deltaX,deltaY,deltaZ],
          decalPosition: [0,0.2,0.1],
          pivotPosition: [0,0.2,0.2],
      };}

      if (itemType === 'totebag') {  
        
        deltaZ = 0.2;

        return {
        ...params,
        deltaX,
        deltaY,
        deltaZ,
        decalScale: [deltaX,deltaY,deltaZ],
        decalPosition: [0,0,0.1],
        pivotPosition: [0,0,0.2]
    };}

    
  }


  if (activeView === 'back') {

    const deltaX = 0.15;
    const deltaY = 0.15 * (currentImage.height / currentImage.width)
    let deltaZ = 0.2;

    if (itemType === 'tshirt') {  return {
        ...params,
        deltaX,
        deltaY,
        deltaZ,
        decalScale: [deltaX,deltaY,deltaZ],
        decalRotation: [0,Math.PI,0],
        meshRotation: [0,Math.PI, 0],
        pivotPosition: [0, 0.1, -0.2],
        pivotRotation: [0,Math.PI,0],
        decalPosition: [0,0.1,-0.1],
    } }
    if (itemType === 'longsleeve' || itemType === 'sweatshirt' || itemType === 'hoodie') {  return {
        ...params,
        deltaX,
        deltaY,
        deltaZ,
        decalScale: [deltaX,deltaY,deltaZ],
        decalRotation: [0,Math.PI,0],
        meshRotation: [0,Math.PI, 0],
        pivotPosition: [0, 0.2, -0.17],
        pivotRotation: [0,Math.PI,0],
        decalPosition: [0,0.2,-0.1],
    } }
    if (itemType === 'totebag') {  
        
      deltaZ = 0.2;

      return {
      ...params,
      deltaX,
      deltaY,
      deltaZ,
      decalScale: [deltaX,deltaY,deltaZ],
      decalPosition: [0,0,-0.1],
      decalRotation: [0,Math.PI,0],
        meshRotation: [0,Math.PI, 0],
        pivotPosition: [0, 0, -0.2],
        pivotRotation: [0,Math.PI,0],
  };}
  }

  if (activeView === 'lsleeve') {

    const deltaX = 0.08;
    const deltaY = 0.08 * (currentImage.height / currentImage.width)
    const deltaZ = 0.15


    return {
        ...params,
        decalRotation: [0,Math.PI / 2,0],
        //decalPosition: [0.25,0.06,-0.025],
        decalPosition: [0.25,0.06,-0.025],
        deltaX,
        deltaY,
        deltaZ,
        decalScale: [deltaX,deltaY,deltaZ],
        meshRotation: [0,Math.PI / -2, 0],
        pivotPosition: [0.4, 0.06, -0.025],
        //pivotRotation: [Math.PI / -2, 0, 0],
        pivotRotation: [0, 0, 0],
        pivotScale: 0.15,
        dragAxis: [false, true, true],
      }
    }
    
  
  
  if (activeView === 'rsleeve') {
    const deltaX = 0.08;
    const deltaY = 0.08 * (currentImage.height / currentImage.width)
    const deltaZ = 0.15
    return {
        ...params,
        decalPosition: [-0.25,0.06,-0.025],
        decalRotation: [0,Math.PI / -2,0],
        deltaX,
        deltaY,
        deltaZ,
        decalScale: [deltaX,deltaY,deltaZ],
        meshRotation: [0,Math.PI / 2, 0],
        pivotPosition: [-0.4, 0.06, -0.025],
        dragAxis: [false, true, true],
      
    }
  }
  return params;
};



// определяет формат изображения (по площади) и стоимость печати
export const getPrintFormatAndPriceFunc = (newAttrs: TParams, activeView: string, color: string) => {
  const [ stageWidth, stageHeight, stageDepth ] = newAttrs.decalScale;
  const width = stageWidth * 120;
  const height = stageHeight * 120;
  const printSqr = width * height;

  let screenSize = '';
  let priceCounter = 0;

  if (printSqr <= 150) {
    screenSize = 'А6';
    priceCounter = color && color === 'белый' ? 300 : 400;
  } else if (printSqr > 150 && printSqr <= 315) {
    screenSize = 'А5';
    priceCounter = color && color === 'белый' ? 400 : 500;
  } else if (printSqr > 315 && printSqr <= 609) {
    screenSize = 'А4';
    priceCounter = color && color === 'белый' ? 500 : 650;
  } else if (printSqr > 609 && printSqr <= 1218) {
    screenSize = 'А3';
    priceCounter = color && color === 'белый' ? 650 : 750;
  } else if (printSqr > 1218 && printSqr <= 1420) {
    screenSize = 'А3+';
    priceCounter = color && color === 'белый' ? 750 : 900;
  } else {
    screenSize = 'А3+';
    priceCounter = color && color === 'белый' ? 750 : 900;
  }

  const displayWidth = Math.round(width) > 35 ? 35 : Math.round(width);
  const displayHeight = Math.round(height) > 42 ? 42 : Math.round(height);

  const cartParams = {
      price: priceCounter,
      format: screenSize,
      size: `${displayWidth} x ${displayHeight} см.`,
      place: activeView,
  }

  return cartParams;
};



const getScene = async (activeView: string, stageRef: any) => {
  // @ts-ignore
  //const preview = await stageRef.current.toDataURL();
  // @ts-ignore
  const scene = await stageRef.current.toBlob();
  const data = new FormData();
  data.append('files', scene, `${activeView}_preview_${uuidv4()}.jpg`);

  //dispatch(uploadPreview(data, activeView));

}

  