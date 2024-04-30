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

        this.scene.add.existing(this);

        this.scene;
    }

    private setupEventListeners() {
        this.on('pointerover', (pointer: Phaser.Input.Pointer) => {
            this.setAlpha(0.5)
            //console.log('over')
        })
        this.on('pointerout', () => {
            this.setAlpha(1)
            //console.log('out')
        })
    }

}