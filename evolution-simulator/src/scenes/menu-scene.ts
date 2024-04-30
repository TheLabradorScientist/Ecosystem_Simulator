import { Button } from "../interfaces/basicButton";
import { Slider } from "../interfaces/basicSlider";

export class MenuScene extends Phaser.Scene {
    private title: Phaser.GameObjects.Text;
    private startButton: Button;
    private popSlider: Slider;

    // Include a settings tab/slider that lets you configure
    // How many different populations of organisms you want
    // (Range from 2-12)
    // Another slider to specify abundance vs scarcity of food (berries)

    // Then a play/Generate button that switches to game scene.

    constructor() {
        super({
            key: 'MenuScene'
        })
    }

    init(): void {
        this.title = this.add.text(100, 100, 'Evolution \nSimulator ', { fontFamily: 'Lugrasimo', fontSize: 80, color: '#80ff40' }).setShadow(6, 8, '#005555', 7, false, true);
        this.startButton = new Button({scene: this, texture: 'genButton', rect: new Phaser.GameObjects.Rectangle(this, 350, 500)})
        
        this.startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        })
        this.popSlider = new Slider({scene: this, texture: 'popSlider', rect: new Phaser.GameObjects.Rectangle(this, 750, 400, 500, 50, 0xffffff, 0.5)})
    }

    create(): void {
        

    }

    update(): void {}


    
}
