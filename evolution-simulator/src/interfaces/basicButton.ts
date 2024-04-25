import { SpriteConstructor } from "./sprite-interface";

export class Button extends Phaser.GameObjects.Sprite {
    name: string;
    scene: Phaser.Scene;

    constructor(aParams: SpriteConstructor) {
        super(aParams.scene, aParams.rect.x, aParams.rect.y, aParams.texture);
        this.name = aParams.texture;
        this.setInteractive();
        this.setDisplaySize(this.width, this.height);
        this.setupEventListeners();

        this.scene.add.image(this.x, this.y, this.name);

        this.scene;
    }

    private setupEventListeners() {
        this.on('pointerover', () => {
            this.scene.add.image(this.x, this.y, this.name);
            console.log('over')
        })
        this.on('pointerout', () => {
            this.scene.add.image(this.x, this.y, this.name);
            console.log('out')
        })
    }

}