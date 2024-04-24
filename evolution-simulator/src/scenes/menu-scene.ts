export class MenuScene extends Phaser.Scene {

    // Include a settings tab/slider that lets you configure
    // How many different populations of organisms you want
    // (Range from 2-12)

    // Then a play/Generate button that switches to game scene.
   
    
    private button: Phaser.GameObjects.Graphics;

    constructor() {
        super({
            key: 'MenuScene'
        })
    }

    preload(): void {
    }

    update(): void {
    }


    
}
