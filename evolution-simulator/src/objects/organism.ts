import { Trait } from "./trait";
import { DrawSector, RandomOrientation, orientationMap } from "../helpers/geometry";
import { detectionTraits, dietTraits, mobilityTraits } from "../helpers/trait-maps";
import { Characteristics } from "../interfaces/characteristics";
import { Detector, Target } from "../interfaces/detector";
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
    private target: Target;
    detector: Detector;
    
    body: Phaser.Physics.Arcade.Body;

    scene: Phaser.Scene;
    rect: Phaser.GameObjects.Rectangle;
    orientation: string;

    constructor(scene: Phaser.Scene, rect: Phaser.GameObjects.Rectangle, orientation: string) {
		super(scene);
		this.rect = rect;
		this.orientation = orientation;
        this.rect.setRotation(orientationMap.get(this.orientation));
		// Phaser.GameObjects.Components.Transform.rotation -- use for orienting organisms

        this.head = NewHead(this.rect);
        this.torso = NewTorso(this.rect);
        this.limbs = NewLimbs(this.rect);
        this.tail = NewTail(this.rect);
        this.parts = new Map<Part, Trait>([])

        this.hunger = 0;
        this.age = 0;
        this.target = null;

        this.MapTraits(headParts, this.head.traits);
        this.MapTraits(torsoParts, this.torso.traits);
        this.MapTraits(limbParts, this.limbs.traits);
        this.parts.set("Tail", this.tail.tail);
        this.characteristics = {diet: 0, metabolism: 0, mobility: 0, visibility: 0, detection: 0, speed: 0, strength: 0}
        this.characteristics.diet = this.CalculateCharacteristic(dietTraits);
        this.characteristics.detection = this.CalculateCharacteristic(detectionTraits)
        this.characteristics.mobility = this.CalculateCharacteristic(mobilityTraits)

        this.detector = new Detector(this.rect, this.characteristics.detection);

        this.scene.add.existing(this);
    }

    Update() {
        this.hunger++;
        this.age++;

    }

    Turn() {
        this.orientation = RandomOrientation();
        this.rect.rotation = orientationMap.get(this.orientation);
        this.detector.sector.orientation = this.rect.rotation;        
    }

    Move() {
        if (this.target == null) {
            let rand = Phaser.Math.Between(0, 8);
            switch (rand) {
                case 1:
                    this.Turn();
                    break;
                case 2:
                    return; 
                default:
                    switch (this.orientation) {
                    case "north":
                        this.rect.y -= 10;
                        break;
                    case "northeast":
                        this.rect.y -= 5;
                        this.rect.x += 5;
                        break;
                    case "east":
                        this.rect.x += 10;
                        break;
                    case "southeast":
                        this.rect.y += 5;
                        this.rect.x += 5;
                        break;    
                    case "south":
                        this.rect.y += 10;
                        break;
                    case "southwest":
                        this.rect.y += 5;
                        this.rect.x -= 5;
                        break;
                    case "west":
                        this.rect.x -= 10;
                        break;
                    case "northwest":
                        this.rect.y -= 5;
                        this.rect.x -= 5;
                        break;                                
                    }
                    this.detector.sector.center.x = this.rect.x;
                    this.detector.sector.center.y = this.rect.y;
                    if (this.rect.x <= 0 || this.rect.y <= 0 || this.rect.x >= 800 || this.rect.y >= 800 ) {
                        this.Turn();
                    }
                    break;
            }
        }
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
        let drawnTraits = [this.torso.build, this.limbs.forelimbShape, 
            this.limbs.hindlimbShape, this.limbs.extremity, 
            this.tail.tail, this.head.nose, this.head.ears, 
            this.head.eyes, this.torso.patterns];
        drawnTraits.forEach((trait: Trait) => {
            if (trait.isDrawable) {
                trait.rect.x, trait.x = this.rect.x;
                trait.rect.y, trait.y = this.rect.y;
                trait.rotation = this.rect.rotation;
                this.add(this.scene.add.existing(trait));
            }
        })
        this.detector.arc = DrawSector(this.detector.arc, this.detector.sector)
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
