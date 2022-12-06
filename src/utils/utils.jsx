







export const fileSelect = (activeView, front_file, back_file, lsleeve_file, rsleeve_file, badge_file) => {
        
        
    if (activeView === 'front' && front_file.file) {         
       
        return {file: front_file, name: front_file.file.name}
    } else if (activeView === 'back' && back_file.file) {
        
        return {file: back_file, name: back_file.file.name}
    } else if (activeView === 'lsleeve' && lsleeve_file.file) {

        return {file: lsleeve_file, name: lsleeve_file.file.name}
    } else if (activeView === 'rsleeve' && rsleeve_file.file) {
        
        return {file: rsleeve_file, name: rsleeve_file.file.name}
    } else if (activeView === 'badge' && badge_file.file) {
        
        return {file: badge_file, name: badge_file.file.name}
    }
}



export const setCoords = (currentImage, activeView, itemType) => {
    

    let imageCoords = {
        x: 125,
        y: 100,
        width: 220,
        height: 300,
    }

    if (activeView === 'front' || activeView === 'back') {



        if (currentImage.width >= currentImage.height) {
            
            const proportion = currentImage.width / currentImage.height;
            const displayWidth = 200;
            const displayHeight = displayWidth / proportion;

            imageCoords = {
            x: 150,
            y: itemType === 'hoodie' ? 140 : 100,
            width: displayWidth,
            height: displayHeight,
            };
        } else {
            const proportion = currentImage.width / currentImage.height;
            const displayHeight = 200;
            const displayWidth = displayHeight * proportion;
            const xCoord = (220 - displayWidth) / 2;

            imageCoords = {
            x: 140 + xCoord,
            y: itemType === 'hoodie' ? 140 : 100,
            width: displayWidth,
            height: displayHeight,
            };
        }

    } else if (activeView === 'lsleeve') {

        if (currentImage.width >= currentImage.height) {
            
            const proportion = currentImage.width / currentImage.height;
            const displayWidth =  itemType === 'hoodie' ? 50 : 80;
            const displayHeight = displayWidth / proportion;

            imageCoords = {
            x: 230,
            y:  itemType === 'hoodie' ? 125 : 105,
            width: displayWidth,
            height: displayHeight,
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
            };
        }
    } else if (activeView === 'rsleeve') {

        if (currentImage.width >= currentImage.height) {
            
            const proportion = currentImage.width / currentImage.height;
            const displayWidth =  itemType === 'hoodie' ? 50 : 80;
            const displayHeight = displayWidth / proportion;

            imageCoords = {
            x:  itemType === 'hoodie' ? 215 : 190,
            y: itemType === 'hoodie' ? 125 : 105,
            width: displayWidth,
            height: displayHeight,
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
            };
        }

    }

    return imageCoords;
}