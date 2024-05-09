import { NewHead, NewTorso, NewLimbs, NewTail, CloneHead, CloneTorso, CloneLimbs, CloneTail } from "../objects/body-parts";
import { Organism } from "../objects/organism";
import { CreateTint } from "./utility";

// 3 * Organism creation: 1) Creating an ancestor randomly
export function RandomOrganism(scene: Phaser.Scene, x: number, y: number, id: number): Organism {
    let org_rect = new Phaser.GameObjects.Rectangle(scene, x, y, 80, 80);
    let scene_rect = new Phaser.Geom.Rectangle(0, 0, window.innerWidth-150, window.innerHeight+75); 
    
    let newColor = CreateTint(0xffffff);    // TODO: Should be used to scale the organism's base color

    let newSize = Phaser.Math.Between(-5, 5); // Might be edited later to implement age
                                                // Max size at a certain age, until which
                                                // the organism keeps growing larger.
    org_rect.setScale(1 + (newSize/20));

    let newHead = NewHead(org_rect);
    let newTorso = NewTorso(org_rect);
    let newLimbs = NewLimbs(org_rect);
    let newTail = NewTail(org_rect);

    return new Organism(scene, org_rect, scene_rect, id, newColor, newSize, newHead, newTorso, newLimbs, newTail);
}

// 2 & 3) Asexual vs sexual reproduction - will take one or two organism phenotypes, resp.
// Menu settings configure which one to use.

// 2) Asexual reproduction
export function CloneOrganism(scene: Phaser.Scene, x: number, y: number, original: Organism): Organism {
    let org_rect = new Phaser.GameObjects.Rectangle(scene, x, y, original.rect.width, original.rect.height);
    let scene_rect = original.sceneBounds; 
    
    let newColor = original.color;  // TODO: Should be used to scale the organism's base color

    let newSize = original.size;    // Might be edited later to implement age
                                    // Max size at a certain age, until which
                                    // the organism keeps growing larger.

    let newHead = CloneHead(scene, org_rect, original.head);
    let newTorso = CloneTorso(scene, org_rect, original.torso);
    let newLimbs = CloneLimbs(scene, org_rect, original.limbs);
    let newTail = CloneTail(scene, org_rect, original.tail);

    return new Organism(original.scene, org_rect, scene_rect, original.populationID, newColor, newSize, newHead, newTorso, newLimbs, newTail);
}

// 2 & 3) Asexual vs sexual reproduction - will take one or two organism phenotypes, resp.
// Menu settings configure which one to use.