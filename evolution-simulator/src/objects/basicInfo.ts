import { SpriteConstructor } from "../interfaces/sprite-interface";

export class Info extends Phaser.GameObjects.Rectangle {
    name: string;
    scene: Phaser.Scene;
    infoText: string;
    infoDisplay: Phaser.GameObjects.Text;

    constructor(aParams: SpriteConstructor, info: string) {
        super(aParams.scene, aParams.rect.x, aParams.rect.y, aParams.rect.width, aParams.rect.height, 0x113333, 0.75);
        this.name = aParams.texture;
        this.setInteractive();
        this.setDisplaySize(this.width, this.height);
        this.setupEventListeners();
        this.infoText = info;
        this.infoDisplay = this.scene.add.text(this.x-170, this.y-230, this.infoText, { fontFamily: 'Times', fontSize: 18, color: '#55ff88' }).setVisible(false).setDepth(6);
        this.scene.add.existing(this);
    }

    private setupEventListeners() {
        this.on('pointerdown', () => {
            this.setVisible(false);
            this.infoDisplay.setVisible(false);
        })
    }
}