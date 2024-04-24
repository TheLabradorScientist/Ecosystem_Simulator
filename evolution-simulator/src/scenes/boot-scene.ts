import WebFont from "webfontloader";

export class BootScene extends Phaser.Scene {
    private loadingBar: Phaser.GameObjects.Graphics;
    private progressBar: Phaser.GameObjects.Graphics;

    constructor() {
        super({
            key: 'BootScene'
        })
    }

    preload(): void {
        this.createLoadingBar();

        this.load.on(
            'progress',
            function(value:number) {
                this.progressBar.clear();
                this.progressBar.fillStyle(0x40f880, 1);
                this.progressBar.fillRect(
                    this.cameras.main.width/4,
                    this.cameras.main.height/2 - 16,
                    (this.cameras.main.width/2)*value,
                    16
                );
            },
            this
        );

        this.load.on(
            'complete',
            function() {
                this.progressBar.destroy();
                this.loadingBar.destroy();
            },
            this
        );

        this.load.pack('preload', './assets/pack.json', 'preload');
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

        WebFont.load({
            google: {
                families: ['Roboto']
            },
            active: () => {
                this.add.text(150, 100, 'Evolution Simulator', { fontFamily: 'Lugrasimo', fontSize: 80, color: '#ffffff' }).setShadow(2, 2, '#333333', 2, false, true);
            }
        })
    }

    update(): void {
        this.scene.start('GameScene');
    }


    private createLoadingBar(): void {
        this.loadingBar = this.add.graphics();
        this.loadingBar.fillStyle(0x000000, 1);
        this.loadingBar.fillRect(
            this.cameras.main.width/4 - 2,
            this.cameras.main.height/2 - 18,
            this.cameras.main.width/2 + 4,
            20
        );
        this.progressBar = this.add.graphics();
    }
}