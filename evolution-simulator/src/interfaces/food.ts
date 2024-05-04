import { SpriteConstructor } from "./sprite-interface";

export interface Food {
    nutritionCap: number; // Maximum # by which it decreases hunger
            // Food source is considered depleted with nutrition = 0
    currNutrition: number; // # that has been consumed.
}

export class Plant extends Phaser.GameObjects.Image implements Food {
    
    nutritionCap: number;
    currNutrition: number;
    // ?? Maybe a partial full image?
    // When currNutrition > 0.4 * nutritionCap
    full_texture: string;
    // When currNutrition < 0.4 * nutritionCap
    empty_texture: string;

    constructor(aParams: SpriteConstructor) {
        super(aParams.scene, aParams.rect.x, aParams.rect.y, aParams.texture);
        this.full_texture = aParams.texture;
        this.empty_texture = aParams.texture2;

        this.nutritionCap = 60;
        this.currNutrition = this.nutritionCap;

        this.scene.add.existing(this);
    }

    Update() {
        if (this.currNutrition < this.nutritionCap) {
            this.currNutrition+=0.0025;
        }
        if (this.currNutrition < 0.5*this.nutritionCap) {
            if (this.texture.key != this.empty_texture) {
                this.setTexture(this.empty_texture); 
            }
        } else {
            if (this.texture.key != this.full_texture) {
                this.setTexture(this.full_texture); 
            }
        }
    }

}