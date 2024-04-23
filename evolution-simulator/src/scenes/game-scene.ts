import { RandomOrientation } from "../helpers/geometry";
import { Organism } from "../objects/organism";

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
        const tree = this.add.image(x*80, y*80, 'treeBg');
        this.trees.add(tree);
    }

    createBerry(x: number, y: number): void {
        const berry = this.add.image(x*80, (y*80)+12, 'berrySource');
        this.berries.add(berry);
    }

    createWaterBody(x: number, y: number): void {
        const water = this.add.image(x*80, y*80, 'waterBg');
        this.waterBodies.add(water);
    }

    create(): void {
        // Generate tile map
        this.map = this.make.tilemap( {key: 'evoBg'} );
        console.log(this.map)
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

        for (let x=0; x < 5; x++) {
            let newX = Phaser.Math.Between(0, window.innerWidth);
            let newY = Phaser.Math.Between(0, window.innerHeight);
            let org = new Organism(this, new Phaser.GameObjects.Rectangle(this, newX, newY, 80, 80), 
                RandomOrientation(), new Phaser.Geom.Rectangle(0, 0, window.innerWidth, window.innerHeight));
            this.population[x] = org;
            this.population[x].Draw();
            console.log(this.population[x].toString())
        }

        this.waterBodies.setDepth(0);
        this.trees.setDepth(2);
        this.berries.setDepth(2);

        this.setOrgDepth();

    }

    setOrgDepth() {
        this.population.forEach((org: Organism) => {

            org.setDepth(2);
            org.detector.arc.setDepth(2)

            let collisionDetected = false;
            let collidedWith: Phaser.GameObjects.Image | null;

            const berryColliders = this.berries.getChildren();
            const treeColliders = this.trees.getChildren();

            berryColliders.forEach((berry: Phaser.GameObjects.Image) => {
                const orgBounds = org.rect.getBounds();
                const berryBounds = berry.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(orgBounds, berryBounds)) {
                    collisionDetected = true;
                    collidedWith = berry;
                    return;
                } 
            })

            treeColliders.forEach((tree: Phaser.GameObjects.Image) => {
                const orgBounds = org.rect.getBounds();
                const treeBounds = tree.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(orgBounds, treeBounds)) {
                    collisionDetected = true;
                    collidedWith = tree;
                    return;
                } 
            })
            
            if (collisionDetected) {
                if (org.rect.getBounds().centerY > collidedWith.getBounds().centerY) {
                    org.setDepth(3);
                    org.detector.arc.setDepth(3);
                } else {
                    org.setDepth(1);
                    org.detector.arc.setDepth(1);
                }
            }
        })
    }

    update() {
        this.population.forEach((org: Organism) => {  
            if (Phaser.Math.Between(0, 5) == 5) {    
                org.Act();
                org.Draw();
            }
        })   
        
        this.setOrgDepth();
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