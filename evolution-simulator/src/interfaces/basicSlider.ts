import { SpriteConstructor } from "./sprite-interface";

export class Slider extends Phaser.GameObjects.Group {
    name: string;
    scene: Phaser.Scene;

    constructor(aParams: SpriteConstructor) {
        super(aParams.scene);
        this.name = aParams.texture;
        this.scene = aParams.scene;

        const bar = this.scene.add.existing(aParams.rect);
        const knob = this.scene.add.circle(aParams.rect.x, aParams.rect.y, 25, 0x000000, 1);
    
        const container = this.scene.add.container(aParams.rect.x, aParams.rect.y);
        container.add(bar); 
        container.add(knob);     

        knob.setInteractive({ draggable: true});
        knob.on('drag', function (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
            knob.x = Phaser.Math.Clamp(dragX, this.x, this.x+this.width);
        }, this); 

        container.setSize(bar.width, bar.height);
        container.setInteractive({ draggable: true });

        container.on('drag', function (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
            container.x = dragX;
            container.y = dragY;
        }, this);

        this.add(container);

        this.setVisible(true);
        
        this.scene.add.existing(this);
        this.scene.add.existing(container);
    }
}