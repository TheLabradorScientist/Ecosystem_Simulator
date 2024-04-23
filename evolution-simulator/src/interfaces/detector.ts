import { DrawSector, Sector } from "../helpers/geometry";

export class Detector {
    sector: Sector;
    arc: Phaser.GameObjects.Graphics;
    scene: Phaser.Scene;

    constructor(rect: Phaser.GameObjects.Rectangle, det: number) {
        this.scene = rect.scene;
        this.sector = {center: {x: rect.x, y: rect.y}, radius: 120 + (3*det), percent: (0.5 - (det/25)), orientation: rect.rotation};

        this.arc = this.scene.add.graphics();
        DrawSector(this.arc, this.sector);
    }

    // Want to call this in update function so it constantly checks if any external
    // object overlaps and returns the object(s) if so, else returns null.
    // Also maybe find a way to change orientation of the organism based on the
    // feedback of the detected object: neutral / move toward / move away
    CollisionDetected(): Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | void {
        const overlaps = this.scene.physics.overlap(this.arc);
        if (overlaps) {
            return; //Object that it overlaps with
        }
    }

}

// Detect function returns the orientation object was detected at
// Calculate whether organism is neutral, moves towards, or moves away from detected object
