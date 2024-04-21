import { Trait } from "../assets/sprites/trait";
import { Rectangle, orientationMap } from "../helpers/geometry";
import { detectionTraits, dietTraits, mobilityTraits } from "../helpers/trait-maps";
import { Characteristics } from "../interfaces/characteristics";
import { Detector } from "../interfaces/detector";
import { SpriteConstructor } from "../interfaces/sprite-interface";
import { Head, Limbs, NewTorso, NewHead, NewLimbs, NewTail, Part, Tail, Torso, torsoToString, headToString, limbsToString, tailToString, headParts, torsoParts, limbParts } from "./body-parts";

export class Organism extends Phaser.GameObjects.Group {
    private head: Head;
    private torso: Torso;
    private limbs: Limbs;
    private tail: Tail;
    private parts: Map<Part, Trait>;
    private hunger: number;
    private age: number;
    private characteristics: Characteristics;
    private detector: Detector;
    
    body: Phaser.Physics.Arcade.Body;

    scene: Phaser.Scene;
    rect: Rectangle;
    orientation: string;

    constructor(aParams: SpriteConstructor) {
		super(aParams.scene);
		this.rect = aParams.rect;
		this.orientation = aParams.orientation;
		// Phaser.GameObjects.Components.Transform.rotation -- use for orienting organisms

        this.head = NewHead(this.scene, this.rect.center, this.orientation);
        this.torso = NewTorso(this.scene, this.rect.center, this.orientation);
        this.limbs = NewLimbs(this.scene, this.rect.center, this.orientation);
        this.tail = NewTail(this.scene, this.rect.center, this.orientation);
        this.parts = new Map<Part, Trait>([])

        this.hunger = 0;
        this.age = 0;

        this.MapTraits(headParts, this.head.traits);
        this.MapTraits(torsoParts, this.torso.traits);
        this.MapTraits(limbParts, this.limbs.traits);
        this.parts.set("Tail", this.tail.tail);
        this.characteristics = {diet: 0, metabolism: 0, mobility: 0, visibility: 0, detection: 0, speed: 0, strength: 0}
        this.characteristics.diet = this.CalculateCharacteristic(dietTraits);
        this.characteristics.detection = this.CalculateCharacteristic(detectionTraits)
        this.characteristics.mobility = this.CalculateCharacteristic(mobilityTraits)

        this.detector = new Detector(this.rect, this.characteristics.detection, this.orientation, this.scene);
        this.detector.Draw();

        this.scene.add.existing(this);
    }

    Update() {
        this.hunger++;
        this.age++;
    }

    Eat() {
        this.hunger = 0;
    }

    MapTraits(partType: string[], traits: Trait[]) {
        traits.forEach((trait: Trait, x: number) => {
            this.parts.set(partType[x], trait);
        })
    }

    CalculateCharacteristic(reference: Map<string, number>): number {
        let value = 0
        this.parts.forEach((trait: Trait) => {
            value += reference.get(trait.name) || 0;
        })
        return value;
    }

    Draw() {
        let drawnTraits = [this.torso.build, this.limbs.forelimbShape, this.limbs.hindlimbShape, this.limbs.extremity, this.tail.tail, this.head.nose, this.head.ears, this.head.eyes, this.torso.patterns]
        drawnTraits.forEach((trait: Trait) => {
            if (trait.isDrawable) {
                trait.rotation = orientationMap.get(this.orientation);
                trait.Draw();
            }
        })
    }
    

    toString(): string {
        return ["ORGANISM:\n{ (HEAD):", headToString(this.head),
            "}\n{ (TORSO): ", torsoToString(this.torso), "}\n{",
            "(LIMBS): ", limbsToString(this.limbs), "}\n{",
            "(TAIL): ", tailToString(this.tail), " }\n{",
            "(ORIENTATION): ", this.orientation, "}",
            "}\n{ (CHARACTERISTICS): Diet =", this.characteristics.diet,
            " / Metabolism =", this.characteristics.metabolism,
            " / Mobility =", this.characteristics.mobility,
            " / Visibility =", this.characteristics.visibility,
            " / Detection =", this.characteristics.detection,
            " / Speed =", this.characteristics.speed,
            " / Strength =", this.characteristics.strength, "}"].join(" ");
    }
}
