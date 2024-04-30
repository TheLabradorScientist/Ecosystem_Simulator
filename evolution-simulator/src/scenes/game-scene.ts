import { RandomOrientation } from "../helpers/geometry";
import { Organism } from "../objects/organism";

// Organism count: determined by main screen input
export var POPCOUNT: number = 4;

export class GameScene extends Phaser.Scene {
    // Tile map stuff
    private map: Phaser.Tilemaps.Tilemap;
    private tileset: Phaser.Tilemaps.Tileset;
    private backgroundLayer: Phaser.Tilemaps.TilemapLayer;

    // Interaction things
    private trees: Phaser.GameObjects.Group;
    private berries: Phaser.GameObjects.Group;
    private waterBodies: Phaser.GameObjects.Group;
    private population: Organism[];

    constructor() {
        super({
            key: 'GameScene'
        })
        this.population = [];
    }

    init(): void {
    }

    createTree(x: number, y: number): void {
        const tree = this.add.image(x*80, (y*80)-10, 'treeBg');
        this.trees.add(tree);
    }

    createBerry(x: number, y: number): void {
        const berry = this.add.image(x*80, (y*80)+15, 'berrySource');
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
                            if (Phaser.Math.Between(1, 5) === 1) {
                                this.createBerry(tile.x, tile.y);
                            }
                        } else if (Phaser.Math.Between(1, 5) === 1) {
                            this.createBerry(tile.x, tile.y);
                        } else if (Phaser.Math.Between(1, 3) == 1) {
                            this.createWaterBody(tile.x, tile.y);
                        }
                    }
                })
            })
        })

        for (let x=0; x < POPCOUNT; x++) {
            let newX = Phaser.Math.Between(0, window.innerWidth);
            let newY = Phaser.Math.Between(0, window.innerHeight);
            let org = new Organism(this, new Phaser.GameObjects.Rectangle(this, newX, newY, 80, 80), 
                RandomOrientation(), new Phaser.Geom.Rectangle(0, 0, window.innerWidth, window.innerHeight));
            this.population[x] = org;
            this.population[x].Draw();
            //console.log(this.population[x].toString())
        }

        this.waterBodies.setDepth(0);
        this.trees.setDepth(2);
        this.berries.setDepth(2);

        this.setOrgDepth();

    }

    // Set up depth of organisms on screen based on collision/overlap detection.
    setOrgDepth() {
        this.population.forEach((org: Organism) => {

            // Set default organism and detector depth.
            org.drawnParts.setDepth(2);
            org.detector.sectorGraphic.setDepth(2)

            let collisionDetected = false;
            let collidedWith: Phaser.GameObjects.Image | null;

            // Set up colliders for each berry/tree on the map.
            const berryColliders = this.berries.getChildren();
            const treeColliders = this.trees.getChildren();

            // Iterate over each berry object, checking for intersection.
            berryColliders.forEach((berry: Phaser.GameObjects.Image) => {
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
            this.population.forEach((org2: Organism) => {
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
                if (org.rect.getBounds().centerY > collidedWith.getBounds().centerY) {
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
        this.setOrgDepth();
        this.population.forEach((org: Organism) => {  
            if (Phaser.Math.Between(0, 5) == 5) {    
                org.Act();
            }
            org.Draw();
        })   
    }
}

/*export class GameScene extends Phaser.Scene {
    
    private mapArray: [][];
    
    // Tile map stuff
    private map: Phaser.Tilemaps.Tilemap;
    private tileset: Phaser.Tilemaps.Tileset;
    private backgroundLayer: Phaser.Tilemaps.TilemapLayer;

    // Interaction things
    private trees: Phaser.GameObjects.Group;
    private berries: Phaser.GameObjects.Group;
    private waterBodies: Phaser.GameObjects.Group;

    constructor() {
        super({
            key: 'GameScene'
        })
    }

    createTree(x: number, y: number): void {
        const tree = this.add.image(x*80, y*80, 'treeBg');
        this.trees.add(tree);
    }

    createBerry(x: number, y: number): void {
        const berry = this.add.image(x*80, y*80, 'berrySource');
        this.berries.add(berry);
    }

    createWaterBody(x: number, y: number): void {
        const water = this.add.image(x*80, y*80, 'waterBg');
        this.waterBodies.add(water);
    }

    preload(): void {
        this.load.pack('preload', './assets/pack.json', 'preload');
    }

    init(): void {}

    create(): void {
        // Generate tile map
        this.map = this.make.tilemap({data: this.mapArray, tileWidth: 80, tileHeight: 80, width: 10, height: 10});
        console.log(this.map)
        this.tileset = this.map.addTilesetImage('grassBg', 'map');

        this.backgroundLayer = this.map.createLayer(
            (50),
            this.tileset,
            0,
            0,
        );
        
        // Set up interaction things
        this.trees = this.add.group();
        this.berries = this.add.group();
        this.waterBodies = this.add.group();

        this.add.image(0, 0, 'grassBg')



/*         // Random generation of tiles and stuff
        this.map.layers.forEach((layer: Phaser.Tilemaps.LayerData) => {
            layer.data.forEach((row: Phaser.Tilemaps.Tile[]) => {
                row.forEach((tile: Phaser.Tilemaps.Tile) => {
                    if (tile.index !== -1) {
                        switch (tile.properties.habitat) {
                        case 'grassland':
                            if (Phaser.Math.Between(1, 10) === 1) {
                                this.createTree(tile.x, tile.y);
                            } else if (Phaser.Math.Between(1, 5) === 1) {
                                this.createBerry(tile.x, tile.y);
                            }
                            break;
                        case 'forest': 
                            this.createTree(tile.x, tile.y);
                            if (Phaser.Math.Between(1, 3) === 1) {
                                this.createBerry(tile.x, tile.y);
                            }
                            break;
                        case 'aquatic': 
                            this.createWaterBody(tile.x, tile.y);
                            break;
                        default:
                            break;
                        }
                    }
                })
            })
        })
    }
}
*/