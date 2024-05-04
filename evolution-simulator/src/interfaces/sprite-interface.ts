export interface SpriteConstructor {
    scene: Phaser.Scene;
    texture: string; // image
    texture2?: string;
    rect: Phaser.GameObjects.Rectangle;
}
