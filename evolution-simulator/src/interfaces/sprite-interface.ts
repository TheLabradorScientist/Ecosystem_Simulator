import { Rectangle } from "../helpers/geometry";

export interface SpriteConstructor {
    scene: Phaser.Scene;
    texture: string; // image
    rect: Rectangle;
    orientation: string;
}
