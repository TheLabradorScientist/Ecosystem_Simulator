import { RandomOrganism, CloneOrganism } from "../helpers/organism-builders";
import { Plant } from "../interfaces/food";
import { Population } from "../interfaces/population";
import { Organism } from "../objects/organism";

// Organism count: determined by main screen input
export var POPCOUNT: number = 4;
export var POPSIZE: number = 3;
export var populationMap = new Map<number, Population>();

export class GameScene extends Phaser.Scene {
    // Tile map stuff
    private map: Phaser.Tilemaps.Tilemap;
    private tileset: Phaser.Tilemaps.Tileset;
    private backgroundLayer: Phaser.Tilemaps.TilemapLayer;

    // Interaction things
    private trees: Phaser.GameObjects.Group;
    private berries: Phaser.GameObjects.Group;
    private waterBodies: Phaser.GameObjects.Group;
    private allLiving: Organism[];

    constructor() {
        super({
            key: 'GameScene'
        })
        this.allLiving = [];
    }

    init(): void {}

    createTree(x: number, y: number): void {
        const tree = this.add.image(x*80, (y*80)-20, 'treeBg');
        tree.scale = 1.2;
        this.trees.add(tree);
    }

    createBerry(x: number, y: number): void {
        let berry: Plant = new Plant({
            scene: this, texture: 'berrySource', 
            texture2: 'depleted_berrySource',
            rect: new Phaser.GameObjects.Rectangle(this, (x*80), (y*80)+25)
        })
        this.berries.add(berry);
    }

    createWaterBody(x: number, y: number): void {
        const water = this.add.image(x*80, (y*80)+10, 'waterBg');
        this.waterBodies.add(water);
    }

    create(): void {
        // Generate tile map
        this.map = this.make.tilemap( {key: 'evoBg'} );
        this.tileset = this.map.addTilesetImage('grass', 'grassBg');

        this.backgroundLayer = this.map.createLayer(
            (0),
            this.tileset,
            0,
            0,
        );
        
        // Set up interaction things
        this.trees = this.add.group();
        this.berries = this.add.group();
        this.waterBodies = this.add.group();

        //this.add.image(0, 0, 'grassBg')

         // Random generation of tiles and stuff
        this.map.layers.forEach((layer: Phaser.Tilemaps.LayerData) => {
            layer.data.forEach((row: Phaser.Tilemaps.Tile[]) => {
                row.forEach((tile: Phaser.Tilemaps.Tile) => {
                    if (tile.index !== -1) {
                        if (Phaser.Math.Between(1, 5) === 1) {
                            this.createTree(tile.x, tile.y);
                            if (Phaser.Math.Between(1, 12) === 1) {
                                this.createBerry(tile.x, tile.y);
                            }
                        } else if (Phaser.Math.Between(1, 7) === 1) {
                            this.createBerry(tile.x, tile.y);
                        } else if (Phaser.Math.Between(1, 3) == 1) {
                            this.createWaterBody(tile.x, tile.y);
                        }
                    }
                })
            })
        })

        for (let x=0; x < POPCOUNT; x++) {
            let newPop: Population = {phenotypeMap: new Map(), livingIndividuals: [], id: x, updateNeeded: false};
            
            let newX = Phaser.Math.Between(0, window.innerWidth-150);
            let newY = Phaser.Math.Between(0, window.innerHeight+75);
            let org = RandomOrganism(this, newX, newY, x);

            newPop.livingIndividuals[0] = org;
            newPop.livingIndividuals[0].Draw();
            this.allLiving.push(newPop.livingIndividuals[0]);

            for (let y=1; y < POPSIZE; y++) {
                let newX = Phaser.Math.Between(0, window.innerWidth-150);
                let newY = Phaser.Math.Between(0, window.innerHeight+75);
                let newOrg = CloneOrganism(this, newX, newY, org);
                newPop.livingIndividuals[y] = newOrg;
                newPop.livingIndividuals[y].Draw();
                this.allLiving.push(newPop.livingIndividuals[y]);
            }

            //console.log(this.population[x].toString())
            populationMap.set(x, newPop);
        }

        this.waterBodies.setDepth(0);
        this.trees.setDepth(2);
        this.berries.setDepth(2);

        this.setOrgDepth();

    }

    // Set up depth of organisms on screen based on collision/overlap detection.
    setOrgDepth() {
        this.allLiving.forEach((org: Organism) => {
            if (org === undefined || org.drawnParts === undefined || org.status != 1) {
                return;   
            }
            // Set default organism and detector depth.
            org.drawnParts.setDepth(2);
            org.detector.sectorGraphic.setDepth(2)

            let collisionDetected = false;
            let collidedWith: Phaser.GameObjects.Image | null;

            // Set up colliders for each berry/tree on the map.
            const berryColliders = this.berries.getChildren();
            const treeColliders = this.trees.getChildren();

            // Iterate over each berry object, checking for intersection.
            berryColliders.forEach((berry: Plant) => {
                berry.Update();
                // Get bounding rectangles
                const orgBounds = org.rect.getBounds();
                const berryBounds = berry.getBounds();
                // Check intersection of bounding rectangles, return if any collision detected.
                if (Phaser.Geom.Intersects.RectangleToRectangle(orgBounds, berryBounds)) {
                    collisionDetected = true;
                    collidedWith = berry;
                    return;
                }
                
                // Set up organism sensing berries.
                let obj = org.detector.CollisionDetected(berry, berryBounds);
                if (obj != null) {
                    org.Sense(obj);
                }
            })

            // Set up organism sensing berries.
            //this.physics.add.group(berryColliders);
            //org.Sense(org.detector.CollisionDetected(berryColliders));

            // Set up organism sensing other organisms.
            //var orgColliders: Phaser.GameObjects.GameObject[] = [];
            this.allLiving.forEach((org2: Organism) => {
                const orgBounds = org2.rect.getBounds();
                let obj = org.detector.CollisionDetected(org2, orgBounds);
                if (obj != null) {
                    org.Sense(obj);
                }
            })

            // Iterate over each tree object, checking for intersection.
            treeColliders.forEach((tree: Phaser.GameObjects.Image) => {
                // Get bounding rectangles
                const orgBounds = org.rect.getBounds();
                const treeBounds = tree.getBounds();
                // Check intersection of bounding rectangles, return if any collision detected.
                if (Phaser.Geom.Intersects.RectangleToRectangle(orgBounds, treeBounds)) {
                    collisionDetected = true;
                    collidedWith = tree;
                    return;
                } 
            })
            
            // Change organism depth if collision detected, 
            if (collisionDetected) {
                // If organism is below collision object, set to bottom layer
                if (org.rect.getBounds().centerY > collidedWith.getBounds().centerY+25) {
                    org.drawnParts.setDepth(3);
                    org.detector.sectorGraphic.setDepth(3);
                } else { // If organism is above collision object, set to top layer
                    org.drawnParts.setDepth(1);
                    org.detector.sectorGraphic.setDepth(1);
                }
            }
        })
    }

    update() {
        // Check for updates to living individuals
        populationMap.forEach((pop: Population) => {
            if (pop.updateNeeded == true) {
                // Iterate through all living individuals in each existing population
                pop.livingIndividuals.forEach((org: Organism) => {
                    // If an organism died, remove it from the scene.
                    if (org.status == -1) {
                        let popIndex = pop.livingIndividuals.indexOf(org);
                        pop.livingIndividuals.splice(popIndex, 1);
                        let liveIndex = this.allLiving.indexOf(org);
                        this.allLiving.splice(liveIndex, 1);
                    }
                    // If an organism was born, add it to the scene.
                    if (org.status == 0) {
                        console.log("NEW ORGANISM")
                        org.status = 1
                        this.allLiving.push(org);
                    }
                })
                pop.updateNeeded = false;
            }
        })
        this.setOrgDepth();
        this.allLiving.forEach((org: Organism) => {   
            if (org === undefined || org.drawnParts === undefined || org.status != 1) {
                return;   
            }
            org.Draw();  
            org.Act();
            org.Update();
        })
    }
}
