import { Button } from "../objects/basicButton";
import { Slider } from "../objects/basicSlider";

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
        this.add.image(0, 0, 'titleArt').setDisplaySize(window.innerWidth-150, window.innerHeight+75).setOrigin(0, 0);
        this.title = this.add.text(100, 100, 'Evolution \nSimulator ', 
            { fontFamily: 'Lugrasimo', fontSize: 80, color: '#80ff40' 
            }).setShadow(6, 8, '#005555', 7, false, true);

        this.startButton = new Button({scene: this, texture: 'genButton', rect: new Phaser.GameObjects.Rectangle(this, 800, 600)}, startScene)
        
        this.popSlider = new Slider({scene: this, texture: 'popSlider', rect: new Phaser.GameObjects.Rectangle(this, 750, 400, 500, 50, 0xffffff, 0.5)})
    }

    create(): void {
    }

    update(): void {}
}

function startScene(): () => any {    
    this.scene.scene.start('GameScene');
    return;
}
