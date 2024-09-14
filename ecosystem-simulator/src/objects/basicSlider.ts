import { SpriteConstructor } from "../interfaces/sprite-interface";

export class Slider extends Phaser.GameObjects.Group {
    name: string;
    scene: Phaser.Scene;
    knob: Phaser.GameObjects.Triangle;
    bar: Phaser.GameObjects.Rectangle;
    value: number;
    numsText: Phaser.GameObjects.Text[];
    title: Phaser.GameObjects.Text;
    buffer: number;

    constructor(aParams: SpriteConstructor, buffer: number) {
        super(aParams.scene);
        this.name = aParams.texture;
        this.scene = aParams.scene;
        this.buffer = buffer;

        this.bar = this.scene.add.existing(aParams.rect).setFillStyle(0x00ffff).setBlendMode('MULTIPLY');

        this.numsText = [];
        this.value = 2+buffer;

        for (let it = 0; it<5; it++) {
            let str = (it + 1 + buffer).toString()
            this.numsText[it] = this.scene.add.text(this.bar.x+210+(88*it), this.bar.y+75+(50*buffer), str, { fontFamily: 'Courier', fontSize: 40, color: '#80ff40' }).setBlendMode("ADD");
        }

        this.title = this.scene.add.text(this.bar.x+250, this.bar.y-25+(50*buffer), aParams.texture, { fontFamily: 'Courier', fontSize: 40, color: '#80ff40' }).setBlendMode("ADD").setAlign('center');

        //const num1 = this.scene.add.text(bar.x+210, bar.y+75, "45", { fontFamily: 'Courier', fontSize: 50, color: '#80ff40' }).setBlendMode("ADD");

        
        this.knob = this.scene.add.triangle(this.bar.x+20, this.bar.y-15, 0, 40, -30, 100, +30, 100, 0xff0055, 1).setBlendMode('ADD');

        
        //const knob = this.scene.add.triangle(bar.x, bar.y, bar.x-25, bar.y+25, bar.x+25, bar.y+25, bar.x, bar.y-25, 0x000000, 1);

        //const knob = this.scene.add.circle(aParams.rect.x, aParams.rect.y, 25, 0x000000, 1);
    
        const container = this.scene.add.container(aParams.rect.x, aParams.rect.y);
        container.add(this.bar); 
        container.add(this.knob);     

        this.bar.setInteractive({draggable: true});

        this.GetValue();

        this.bar.on('pointerdown', function (_pointer: Phaser.Input.Pointer, dragX: number, _dragY: number) {
            this.knob.x = Phaser.Math.Clamp(dragX+240, this.bar.x-(this.bar.width/2)+20, this.bar.x+(this.bar.width/2)+20);
            this.GetValue()
        }, this); 

        container.setSize(this.bar.width, this.bar.height);

        this.add(container);

        this.setVisible(true);
        
        this.scene.add.existing(this);
        this.scene.add.existing(container);
    }

    GetValue(): number {
        let val = Math.floor((this.knob.x - (this.bar.x-(this.bar.width/2)-20))/100)+1+this.buffer;
        if (val !== this.value) {
            this.numsText[this.value-1-this.buffer].setColor('#80ff40');
            this.value = val;
            this.numsText[this.value-1-this.buffer].setColor('#ffffff')
        } else {return this.value};
    }
}