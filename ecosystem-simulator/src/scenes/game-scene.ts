import { Grid } from "../helpers/grid";
import { RandomOrganism, CloneOrganism } from "../helpers/organism-builders";
import { Food, Meat, Plant } from "../interfaces/food";
import { Population } from "../interfaces/population";
import { Organism } from "../objects/organism";
import * as dat from 'dat.gui'

// Organism count: determined by main screen input
export var POPCOUNT: number = 7;
export var POPSIZE: number = 5;
export var populationMap = new Map<number, Population>();
export var mapWidth = 0;
export var mapHeight = 0;

export class GameScene extends Phaser.Scene {
    // Tile map stuff
    private map: Phaser.Tilemaps.Tilemap;
    private tileset: Phaser.Tilemaps.Tileset;
    private backgroundLayer: Phaser.Tilemaps.TilemapLayer;

    // Interaction things
    private trees: Phaser.GameObjects.Group;
    private berries: Phaser.GameObjects.Group;
    private carrion: Phaser.GameObjects.Group;
    private waterBodies: Phaser.GameObjects.Group;

    private grid: Grid;

    private controls: Phaser.Cameras.Controls.SmoothedKeyControl;

    constructor() {
        super({
            key: 'GameScene'
        })
    }

    init(): void {}

    createTree(x: number, y: number): void {
        const tree = this.add.image((x*80)+38, (y*80)+15, 'treeBg');
        tree.scale = 1.2;
        this.trees.add(tree);
        this.grid.AddObject(tree);
    }

    createBerry(x: number, y: number): void {
        let berry: Plant = new Plant({
            scene: this, texture: 'berrySource', 
            texture2: 'depleted_berrySource',
            rect: new Phaser.GameObjects.Rectangle(this, (x*80)+38, (y*80)+55)
        })
        this.berries.add(berry);
        this.grid.AddObject(berry);
    }

    createCarrion(x: number, y: number, nutritionCap: number): Meat {
        let meat: Meat = new Meat({
            scene: this, texture: 'meatSource', 
            texture2: 'depleted_meatSource',
            rect: new Phaser.GameObjects.Rectangle(this, x+38, y+55)
        }, nutritionCap)
        if (meat !instanceof Meat) {
            return null;
        }
        this.carrion.add(meat);
        this.grid.AddObject(meat);
        return meat;
    }

    createWaterBody(x: number, y: number): void {
        const water = this.add.image((x*80)+38, (y*80)+40, 'waterBg');
        this.waterBodies.add(water);
        // this.grid.AddObject(water); Make water detectable ?
    }

    create(): void {
        // Generate tile map
        this.map = this.make.tilemap( {key: 'ecoBg'} );
        this.tileset = this.map.addTilesetImage('grass', 'grassBg');

        this.backgroundLayer = this.map.createLayer(
            (0),
            this.tileset,
            0,
            0,
        );

        mapWidth = this.map.widthInPixels/2.5;
        mapHeight = this.map.heightInPixels/2.5;
        
        // Set up interaction things
        this.trees = this.add.group();
        this.berries = this.add.group();
        this.carrion = this.add.group();
        this.waterBodies = this.add.group();

        //this.add.image(0, 0, 'grassBg')

        // Set up grid.
        this.grid = new Grid(this);

        // Random generation of tiles and stuff
        this.map.layers.forEach((layer: Phaser.Tilemaps.LayerData) => {
            layer.data.forEach((row: Phaser.Tilemaps.Tile[]) => {
                row.forEach((tile: Phaser.Tilemaps.Tile) => {
                    if (tile.index !== -1) {
                        if (Phaser.Math.Between(1, 10) === 1) {
                            this.createTree(tile.x, tile.y);
                            if (Phaser.Math.Between(1, 10) === 1) {
                                this.createBerry(tile.x, tile.y);
                            }
                        } else if (Phaser.Math.Between(1, 10) === 1) {
                            this.createBerry(tile.x, tile.y);
                        } else if (Phaser.Math.Between(1, 3) == 1) {
                            this.createWaterBody(tile.x, tile.y);
                        }
                    }
                })
            })
        })

        this.grid.Update();
        this.grid.Print();

        for (let x=0; x < POPCOUNT; x++) {
            let newPop: Population = {phenotypeMap: new Map(), livingIndividuals: new Set<Organism>, id: x, updateNeeded: false};
            
            let newX = Phaser.Math.Between(0, mapWidth);
            let newY = Phaser.Math.Between(0, mapHeight);
            let org = RandomOrganism(this, newX, newY, x);
            org.grid_index = this.grid.AddObject(org);
            //console.log(org.grid_index + " | " + this.grid.boxes[org.grid_index].containedOrganisms.size);

            newPop.livingIndividuals.add(org);
            org.Draw();

            for (let y=1; y < POPSIZE; y++) {
                let newX = Phaser.Math.Between(0, mapWidth);
                let newY = Phaser.Math.Between(0, mapHeight);
                let newOrg = CloneOrganism(this, newX, newY, org);
                newPop.livingIndividuals.add(newOrg);
                newOrg.grid_index = this.grid.AddObject(newOrg);
                newOrg.Draw();
            }

            //console.log(this.population[x].toString())
            populationMap.set(x, newPop);
        }

        this.waterBodies.setDepth(1);
        this.trees.setDepth(3);
        this.berries.setDepth(3);
        this.carrion.setDepth(3);

        this.UpdateObjects();

        // Camera/World controls and config.
        const cursors = this.input.keyboard.createCursorKeys();

        const controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
            zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
            acceleration: 0.1,
            drag: 0.0005,
            maxSpeed: 3
        };

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        const cam = this.cameras.main.setBounds(0, 0, 2560, 2560, true);

        const gui = new dat.GUI();

        const help = {
            line1: 'Arrow keys to move',
            line2: 'Z & X to zoom'
        }

        const f1 = gui.addFolder('Camera');
        f1.add(cam, 'x').listen();
        f1.add(cam, 'y').listen();
        f1.add(cam, 'scrollX').listen();
        f1.add(cam, 'scrollY').listen();
        f1.add(cam as any, 'rotation').min(0).step(0.01).listen();
        f1.add(cam, 'zoom', 0.4, 2).step(0.1).listen();
        f1.add(help, 'line1');
        f1.add(help, 'line2');
        f1.open();
    }

    // Check for collisions between the given organism and each object on screen.
    checkColliders(colliders: Phaser.GameObjects.GameObject[], org: Organism, collided: Phaser.GameObjects.Image | null): Phaser.GameObjects.Image | null {
        // Iterate over each object, checking for intersection.
        colliders.forEach((elem: Phaser.GameObjects.Image) => {

            // Get bounding rectangles
            const orgBounds = org.rect.getBounds();
            const elemBounds = elem.getBounds();

            // Check intersection of bounding rectangles, return if any collision detected.
            if (Phaser.Geom.Intersects.RectangleToRectangle(orgBounds, elemBounds)) {
                if (elem !instanceof Food && elem !instanceof Organism) {
                    console.log("TREE");
                }
                collided = elem;
            }

            // TEMP-CODE UNTIL TREE FUNCTIONALITY IMPLEMENTED
            if (elem !instanceof Food && elem !instanceof Organism) {
                return;
            }

            // Set up organism sensing elems.
            let obj = org.detector.CollisionDetected(elem, elemBounds);
            if (obj != null) {
                org.Sense(obj);
            }
        })
        return collided;
    }

    // Set up depth of organisms on screen based on collision/overlap detection.
    UpdateObjects() {
        // Set up colliders for each berry/tree on the map.
        const berryColliders = this.berries.getChildren();
        const meatColliders = this.carrion.getChildren();
        const treeColliders = this.trees.getChildren();
        berryColliders.forEach((berry: Plant) => berry.Update());
        meatColliders.forEach((meat: Meat) => {
            meat.Update();
            if (meat.currNutrition === 0) {
                this.carrion.remove(meat, true, true);
            }
        })
    }

    // Check adjacent boxes for organism collision
    CheckOrgColliders(org: Organism, objColl: Phaser.GameObjects.Image[], orgColl: Set<Organism>) {
        if (typeof org === 'undefined' || typeof org.drawnParts === 'undefined' || org.status != 1) {
            return;   
        }
        // Set default organism and detector depth.
        org.drawnParts.setDepth(2);
        org.detector.sectorGraphic.setDepth(2)

        let collidedWith: Phaser.GameObjects.Image | null = null;

        // Iterate over each object, checking for intersection.
        collidedWith = this.checkColliders(objColl, org, collidedWith);

        // Set up organism sensing other organisms.
        orgColl.forEach((org2: Organism) => {
            const orgBounds = org2.rect.getBounds();
            let other = org.detector.CollisionDetected(org2, orgBounds);
            if (other != null) {
                org.Sense(other);
            }
        })

        // Change organism depth if collision detected, 
        if (collidedWith != null) {
            // If organism is below collision object, set to bottom layer
            if (org.rect.getBounds().centerY > collidedWith.getBounds().centerY+25) {
                org.drawnParts.setDepth(4);
                org.detector.sectorGraphic.setDepth(4);
            } /* else { // If organism is above collision object, set to top layer
                org.drawnParts.setDepth(2);
                org.detector.sectorGraphic.setDepth(2);
            } */ 
        }
    }

    update (_time: number, delta: number) {
        // Update Camera/World controls
        this.controls.update(delta);
        
        // Check for updates to living individuals
        populationMap.forEach((pop: Population) => {
            if (pop.updateNeeded === true) {
                // Iterate through all living individuals in each existing population
                pop.livingIndividuals.forEach((org: Organism) => {
                    // If an organism died, remove it from the scene.
                    if (org.status === -1) {
                        pop.livingIndividuals.delete(org);
                    }
                    // If an organism was born, add it to the scene.
                    if (org.status === 0) {
                        console.log("NEW ORGANISM")
                        org.status = 1
                    }
                })
                pop.updateNeeded = false;
            }
        })

        for (let [, pop] of populationMap) {   
            pop.livingIndividuals.forEach((org: Organism) => {
                if (typeof org === 'undefined' || typeof org.drawnParts === 'undefined' || org.status !== 1) {
                    return;   
                }

                //console.log(org.grid_index)

                const adjacentBoxes = this.grid.GetAdjacentBoxes(org.grid_index);
                let arr: Phaser.GameObjects.Image[] = []; 
                let orgColliders: Set<Organism> = new Set<Organism>;
                
                // Noticed error: adjacentBoxes  logs an Array of len 2, [NaN, NaN] right before error. How?
                // console.log(adjacentBoxes)
                adjacentBoxes.forEach((index: number) => {
                    // console.log(index)

                    arr = arr.concat(this.grid.boxes[index].containedObjects);
                    this.grid.boxes[index].containedOrganisms.forEach((org2: Organism) => {
                        orgColliders.add(org2)
                    });
                    
                })
                this.CheckOrgColliders(org, arr, orgColliders);

                org.Draw();  
                org.Act();
                org.Update();

                let tempIndex = (org.rect.x >=0 && org.rect.y >= 0 
                    && org.rect.x < 8 * 320 && org.rect.y < 8*320) ? 
                        this.grid.ConvertXYToIndex(org.rect.x, org.rect.y) : org.grid_index;
                if (!Number.isNaN(tempIndex) && typeof tempIndex !== 'undefined' && tempIndex !== org.grid_index) {
                    // console.log(tempIndex)
                    this.grid.boxes[org.grid_index].containedOrganisms.delete(org);
                    this.grid.boxes[tempIndex].containedOrganisms.add(org);
                    org.grid_index = tempIndex;
                }
            })
        }

        this.UpdateObjects();
    }
}
