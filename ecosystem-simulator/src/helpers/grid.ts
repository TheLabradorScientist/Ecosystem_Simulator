// Use hash table to keep track of all boxes in grid.
// Box object = Geometric rectangle, fixed objects in beginning but updates 
//              when organism moves

import { Organism } from "../objects/organism";

const BOX_DIMENSIONS = 320 // x 320
const GRID_LINE_COUNT = 8

export class Box extends Phaser.Geom.Rectangle {
    containedObjects: Phaser.GameObjects.Image[];
    containedOrganisms: Set<Organism>;

    constructor(x: number, y: number) {
        super(x, y, BOX_DIMENSIONS, BOX_DIMENSIONS);
        this.containedObjects = [];
        this.containedOrganisms = new Set<Organism>;
    }

    Update(popArr: Organism[]) {
        // Iterate through popArr to see if any organisms are in/out bounds.
        // Add if so, remove if was previously but now not.
        // Alternative ways?? Seems to defeat the purpose.
    }

    Print(): String {
        return "[ " + this.containedObjects.length + " ]";
    }
        
}

export class Grid {
    scene: Phaser.Scene;
    boxes: Box[];

    // Let grid be 8 rows, 8 columns
    // Each box = 320 px, so 4 tiles per box.
    // 32 R+C -> 8
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.boxes = [];
        const GLCsq = Math.pow(GRID_LINE_COUNT, 2);
        for (let val = 0; val < GLCsq; val++) {
            let x = (val % GRID_LINE_COUNT) * BOX_DIMENSIONS; 
            // 0-7 -> 0, 8-15 -> 1, etc.
            let y = Math.floor(val/GRID_LINE_COUNT)*BOX_DIMENSIONS;
            this.boxes.push(new Box(x, y));
        }
    }

    // Add an object to a grid box.
    AddObject(obj: Phaser.GameObjects.Image | Organism): number {
        let x: number, y: number;
        const objType = obj instanceof Organism ? 0 : 1
        if (obj instanceof Organism) {
            x = obj.rect.getBounds().centerX;
            y = obj.rect.getBounds().centerY;
        } else {
            x = obj.getBounds().centerX;
            y = obj.getBounds().centerY;
        }
        const index = this.ConvertXYToIndex(x, y);

        if (obj instanceof Organism) {
            this.boxes[index].containedOrganisms.add(obj);
        } else {
            this.boxes[index].containedObjects.push(obj);
        }

        return index;
    }

    ConvertXYToIndex(x: number, y: number): number {
        // Each box is 320 x 320. How to find the right box?
        // First box is at 0, 0, centered at 160, 160.
        // 0 <= x < 320 -> index must be 0-7
        // 0 <= y < 320 -> index must be 0, 8, 16, etc... 64.

        const row = Math.floor(x / BOX_DIMENSIONS);
        const col = Math.floor(y / BOX_DIMENSIONS);

        const index = (GRID_LINE_COUNT * col) + row

        return index;
    }

    // Calculate the indices of all boxes adjacent to a given box.
    GetAdjacentBoxes(curr: number): number[] {
        const numArr: number[] = [];
        let exception: number = 0;
        // ROW 1 => NO ROW ABOVE // ROW 8 => NO ROW BELOW
        // COL 1 => NO COL BEFORE // COL 8 => NO COL AFTER
        // Possible adjacent: -9, -8, -7, -1, +1, +7, +8, +9

        // Check if box is in first column; exception if true
        curr % GRID_LINE_COUNT !== 0 ? numArr.push(curr - 1) : exception = -1;
        
        // Check if box is in last column; exception if true
        curr % GRID_LINE_COUNT !== GRID_LINE_COUNT-1 ? numArr.push(curr + 1) : exception = 1;
        
        // If box is not in first row, then add adjacent boxes above.
        if (curr >= GRID_LINE_COUNT) {
            switch (exception) {
                case -1:
                    numArr.push(curr - GRID_LINE_COUNT);
                    numArr.push(curr - GRID_LINE_COUNT + 1);
                    break;
                case 0:
                    numArr.push(curr - GRID_LINE_COUNT);
                    numArr.push(curr - GRID_LINE_COUNT + 1);
                    numArr.push(curr - GRID_LINE_COUNT - 1);
                    break;
                case 1:
                    numArr.push(curr - GRID_LINE_COUNT);
                    numArr.push(curr - GRID_LINE_COUNT - 1);
                    break;
            } 
        }

        // If box is not in last row, then add adjacent boxes below.
        if (curr < (GRID_LINE_COUNT*(GRID_LINE_COUNT-1))) {
            switch (exception) {
                case -1:
                    numArr.push(curr + GRID_LINE_COUNT);
                    numArr.push(curr + GRID_LINE_COUNT + 1);
                    break;
                case 0:
                    numArr.push(curr + GRID_LINE_COUNT);
                    numArr.push(curr + GRID_LINE_COUNT + 1);
                    numArr.push(curr + GRID_LINE_COUNT - 1);
                    break;
                case 1:
                    numArr.push(curr + GRID_LINE_COUNT);
                    numArr.push(curr + GRID_LINE_COUNT - 1);
                    break;
            } 
        }
        return numArr;
    }

    Update() {
        this.boxes.forEach((box: Box, num: number) => {
            let color = num % 2 === 0 && Math.floor(num/GRID_LINE_COUNT) % 2 === 0 || 
                num % 2 === 1 && Math.floor(num/GRID_LINE_COUNT) % 2 === 1 ? 0xffffff : 0x000000;
            this.scene.add.rectangle(box.centerX, box.centerY, BOX_DIMENSIONS, BOX_DIMENSIONS, color, 0.20);
            //console.log(box.centerX, box.centerY)
        })
    }

    Print() {
        let str = " {{ -+- "
        this.boxes.forEach((box: Box) => {
            str += "{" + box.Print() + "} -+- "
        })
        str += " }}"
        console.log(str);
        // console.log(this.GetAdjacentBoxes(50))
    }
}