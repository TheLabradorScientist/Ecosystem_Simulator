import { Button } from "../objects/basicButton";
import { Slider } from "../objects/basicSlider";

// Organism count: determined by main screen input
export var POPCOUNT: number = 7;
export var POPSIZE: number = 5;

export class MenuScene extends Phaser.Scene {
    private title: Phaser.GameObjects.Text;
    private startButton: Button;
    static popCountSlider: Slider;
    static popSizeSlider: Slider;

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
        this.add.image(0, 0, 'titleArt').setDisplaySize(window.innerWidth-50, window.innerHeight+75).setOrigin(0, 0);
        this.title = this.add.text(75, 100, 'Ecosystem \nSimulator ', 
            { fontFamily: 'Lugrasimo', fontSize: 80, color: '#65ff95', 
            }).setBlendMode('ADD').setShadow(5, 10, '#002050', 5, false, true).setAlpha(0.9, 0.6, 0.6, 0.3);

        this.startButton = new Button({scene: this, texture: 'genButton', rect: new Phaser.GameObjects.Rectangle(this, 825, 650)}, startScene)
        
        MenuScene.popCountSlider = new Slider({scene: this, texture: "# of \nPopulations", rect: new Phaser.GameObjects.Rectangle(this, 400, 100, 400, 75, 0xffffff, 0.5)}, 0)
        MenuScene.popSizeSlider = new Slider({scene: this, texture: "# Members per\nPopulation", rect: new Phaser.GameObjects.Rectangle(this, 400, 200, 400, 75, 0xffffff, 0.5)}, 2)
    }

    create(): void {
    }

    update(): void {}


    static GetStats(): number[] {
        return [this.popCountSlider.value, this.popSizeSlider.value];
    }
}

function startScene(): () => any {
    const stats: number[] = MenuScene.GetStats();    
    POPCOUNT = stats[0];
    POPSIZE = stats[1];
    console.log(POPSIZE)
    this.scene.scene.start('GameScene');
    return;
}
