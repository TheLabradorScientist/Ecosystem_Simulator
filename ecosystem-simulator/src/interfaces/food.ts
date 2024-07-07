import { SpriteConstructor } from "./sprite-interface";

export class Food extends Phaser.GameObjects.Image {
    nutritionCap: number; // Maximum # by which it decreases hunger
            // Food source is considered depleted with nutrition = 0
    currNutrition: number; // # that has been consumed.

    // Partial full image
    // When currNutrition > 0.4 * nutritionCap
    full_texture: string;
    // When currNutrition < 0.4 * nutritionCap
    empty_texture: string;

    constructor(aParams: SpriteConstructor, nutritionCap: number) {
        super(aParams.scene, aParams.rect.x, aParams.rect.y, aParams.texture);
        this.full_texture = aParams.texture;
        this.empty_texture = aParams.texture2

        this.nutritionCap = nutritionCap;
        this.currNutrition = this.nutritionCap;

        this.scene.add.existing(this);
    }
}

export class Plant extends Food {
    
    nutritionCap: number;
    currNutrition: number;
    // Partial full image
    // When currNutrition > 0.4 * nutritionCap
    full_texture: string;
    // When currNutrition < 0.4 * nutritionCap
    empty_texture: string;

    constructor(aParams: SpriteConstructor) {
        super(aParams, 60);
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

export class Meat extends Food {
    nutritionCap: number;
    currNutrition: number;
    // Partial full image
    // When currNutrition > 0.4 * nutritionCap
    full_texture: string;
    // When currNutrition < 0.4 * nutritionCap
    empty_texture: string;

    constructor(aParams: SpriteConstructor, nutritionCap: number) {
        super(aParams, nutritionCap);
        this.setTexture(this.full_texture); 
    }

    Update() {
        if (this.currNutrition < 0.5*this.nutritionCap && this.texture.key != this.empty_texture) {
            this.setTexture(this.empty_texture); 
        }
        this.currNutrition -= 0.001;
    }
}
