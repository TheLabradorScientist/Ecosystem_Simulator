import { Trait } from "./trait";
import { DrawSector, GetRelativePosition, RandomOrientation, Target, oppositeOrientation, orientationMap } from "../helpers/geometry";
import { detectionTraits, dietTraits, mobilityTraits, speedTraits, strengthTraits, visibilityTraits } from "../helpers/trait-maps";
import { Characteristics } from "../interfaces/characteristics";
import { Detector } from "../interfaces/detector";
import { Head, Limbs, NewTorso, NewHead, NewLimbs, NewTail, Part, Tail, Torso, torsoToString, headToString, limbsToString, tailToString, headParts, torsoParts, limbParts } from "./body-parts";

export class Organism extends Phaser.GameObjects.GameObject {
    private head: Head;
    private torso: Torso;
    private limbs: Limbs;
    private tail: Tail;
    drawnParts: Phaser.GameObjects.Group;
    private parts: Map<Part, Trait>;
    private hunger: number;

    private energy: number; // Determines the probability that the organism will move.
            // Recovered over time if hunger < 3/4 metabolism. Max = metabolism value.

    private age: number;
    private characteristics: Characteristics;
    private target: Target;
    private targetLock: boolean;

    detector: Detector;
    
    body: Phaser.Physics.Arcade.Body;

    scene: Phaser.Scene;
    sceneBounds: Phaser.Geom.Rectangle;
    rect: Phaser.GameObjects.Rectangle;
    orientation: string;

    constructor(scene: Phaser.Scene, rect: Phaser.GameObjects.Rectangle, orientation: string, bounds: Phaser.Geom.Rectangle) {
		super(scene, 'sprite');
        this.sceneBounds = bounds;
		this.rect = rect;
		this.orientation = orientation;
        this.rect.setRotation(orientationMap.get(this.orientation));
		// Phaser.GameObjects.Components.Transform.rotation -- use for orienting organisms

        this.drawnParts = new Phaser.GameObjects.Group(this.scene);
        this.head = NewHead(this.rect);
        this.torso = NewTorso(this.rect);
        this.limbs = NewLimbs(this.rect);
        this.tail = NewTail(this.rect);
        this.parts = new Map<Part, Trait>([])

        this.hunger = 0;
        this.age = 0;
        this.target = {object: null, objectBounds: null, relationship: 0};
        this.targetLock = false;

        this.MapTraits(headParts, this.head.traits);
        this.MapTraits(torsoParts, this.torso.traits);
        this.MapTraits(limbParts, this.limbs.traits);
        this.parts.set("Tail", this.tail.tail);
        this.characteristics = {diet: 0, metabolism: 0, mobility: 0, visibility: 0, detection: 0, speed: 0, strength: 0}
        this.characteristics.diet = this.CalculateCharacteristic(dietTraits);
        this.characteristics.metabolism = 100;
        this.characteristics.visibility = this.CalculateCharacteristic(visibilityTraits);
        this.characteristics.detection = this.CalculateCharacteristic(detectionTraits);
        this.characteristics.mobility = this.CalculateCharacteristic(mobilityTraits);
        this.characteristics.speed = this.CalculateCharacteristic(speedTraits);
        this.characteristics.strength = this.CalculateCharacteristic(strengthTraits);

        this.energy = this.characteristics.metabolism;

        this.detector = new Detector(this.rect, this.characteristics.detection);

        this.scene.add.existing(this);
    }

    Update() {
        this.hunger++;
        this.age++;

    }

    TurnTo(orient: string) {
        this.orientation = orient;
        this.rect.rotation = orientationMap.get(this.orientation);
        this.detector.sector.orientation = this.rect.rotation;        
    }

    Act() {
        if (this.target.object == null) {
            let rand = Phaser.Math.Between(0, 8);
            switch (rand) {
                case 1:
                    this.TurnTo(RandomOrientation());
                    break;
                case 2:
                    return; 
                default:
                    if (this.rect.x <= 0 || this.rect.y <= 0 || this.rect.x >= this.sceneBounds.width || this.rect.y >= this.sceneBounds.height ) {
                        this.TurnTo(GetRelativePosition(this.rect.getBounds(), this.sceneBounds));
                    }
                    this.Move();

                    // IDEA: Alternative function GetUnstuck() sets organism's target
                    // to the center of the scene (sceneBounds centerX, center Y) &
                    // results in organism moving to center until no longer offscreen.
                    // Target = sceneBounds, relationship = +10
                    break;
            }
        } else {
            if (this.targetLock == false) {
                // Set target lock based on probability,
                // definite lock if |relationship| > 5. 
                // definite not if |relationship| < 2. 
                if (Math.abs(this.target.relationship) + Phaser.Math.Between(4, 8) > 10) {
                    if (this.target.relationship > 0) {
                        console.log("Target locked: Food")  
                    } else {
                        console.log("Target locked: Predator");
                    }
                    this.targetLock = true; 
                } else {
                    this.target = {object: null, objectBounds: null, relationship: 0};
                    return;
                }
            }
            if (this.target.relationship > 0) {
                this.TurnTo(GetRelativePosition(this.rect.getBounds(), this.target.objectBounds));
            } else { // relationship < 0
                this.TurnTo(oppositeOrientation.get(GetRelativePosition(this.rect.getBounds(), this.target.objectBounds)));
            }
            
            let rectBounds = this.rect.getBounds();
            if ((Math.abs(rectBounds.centerX - this.target.objectBounds.centerX) > 20) || (Math.abs(rectBounds.centerY - this.target.objectBounds.centerY) > 20)) {
                this.Move();
                //console.log(this.targetLock, ' locked on ', this.target.relationship)
                //console.log("Organism coordinates: ", this.rect.x, this.rect.y);   
            } else {
                this.Eat();
                this.target = {object: null, objectBounds: null, relationship: 0};
                this.targetLock = false;
            }
        }
    }

    Move() {
        // Maybe make movement affected by energy
        const movement = 10 + this.characteristics.speed/2;
        switch (this.orientation) {
        case "north":
            this.rect.y -= movement;
            break;
        case "northeast":
            this.rect.y -= movement/2;
            this.rect.x += movement/2;
            break;
        case "east":
            this.rect.x += movement;
            break;
        case "southeast":
            this.rect.y += movement/2;
            this.rect.x += movement/2;
            break;    
        case "south":
            this.rect.y += movement;
            break;
        case "southwest":
            this.rect.y += movement/2;
            this.rect.x -= movement/2;
            break;
        case "west":
            this.rect.x -= movement;
            break;
        case "northwest":
            this.rect.y -= movement/2;
            this.rect.x -= movement/2;
            break;                                
        }
        this.detector.sector.center.x = this.rect.x;
        this.detector.sector.center.y = this.rect.y;
        this.energy--;
        this.hunger++
    }

    Eat() {
        this.hunger = 0;
        this.energy = this.characteristics.metabolism;
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
                trait.rect.x = this.rect.x;
                trait.x = this.rect.x;
                trait.rect.y = this.rect.y;
                trait.y = this.rect.y;
                trait.rotation = this.rect.rotation;
                this.drawnParts.add(this.scene.add.existing(trait));
            }
        })
        this.detector.sectorGraphic = DrawSector(this.detector.sectorGraphic, this.detector.sector)
    }

    Sense(object: null | Phaser.GameObjects.Image | Organism) {   
        //console.log(this.detector.detectedObjects);  
        if (object != null) {
            let objectBounds: Phaser.Geom.Rectangle;
            if (object instanceof Organism) {
                objectBounds = object.rect.getBounds();
                if (this.checkIfPredator(object)) {
                    let rel = -10; // TODO: calculate
                    // Set your priorities in life >:)
                    if (Math.abs(rel) > this.target.relationship) {
                        this.target = {object: object, objectBounds: objectBounds, relationship: rel};
                    }
                    return;
                }
            } else {
                objectBounds = object.getBounds();
            }
            if (this.checkIfFood(object)) {
                console.log("Hunger probability: ", this.hunger/this.characteristics.metabolism)
                let temp = this.hunger/this.characteristics.metabolism
                if (temp < 0.5) {temp = 0}
                let rel = (temp)*10; // TODO: calculate
                // Set your priorities in life 2.0 >:)
                if (Math.abs(rel) > this.target.relationship) {
                    // May need to edit this and add a "type" to target with food vs predator vs potential mate
                    // Check if both targets are attractive
                    if (rel > 0 && this.target.relationship > 0) {
                        // If yes, then just set relationship to new value
                        this.target.relationship = rel;
                    } else {
                        // Else, set the target to the stronger priority
                        this.target = {object: object, objectBounds: objectBounds, relationship: rel};
                    }
                }
                return;
            }
        }
    }

    checkIfFood(obj: Phaser.GameObjects.Image | Organism): boolean {
        if (obj instanceof Phaser.GameObjects.Image) {
            this.detector.detectedObjects.shift()
            return true;   
        }
        return false;

        // if checkIfFood => true, then set target with + relationship, dependent
        // on hunger. Lower hunger = closer to neutral (0). If prey = other
        // organism, then check relative strength and weigh against hunger.
    }

    checkIfPredator(obj: Organism): boolean {
        
        this.detector.detectedObjects.shift()
        return true;

        //if checkIfPredator => true, then set target with - relationship,
        // dependent on strength vs speed. Low speed, high strength
        // => closer to neutral (0). Maybe separate method for calculating
        // probability of fight or flight. Maybe aggression variable will
        // mean + relationship target even if predator = true.
    }

    Die() {
        this.drawnParts.destroy(true, true);
        this.destroy(true);
    }

    toString(): string {
        return ["ORGANISM:\n{ (HEAD):", headToString(this.head),
            "}\n{ (TORSO): ", torsoToString(this.torso), "}\n{",
            "(LIMBS): ", limbsToString(this.limbs), "}\n{",
            "(TAIL): ", tailToString(this.tail), " }\n{",
            "(ORIENTATION): ", this.orientation, "}",
            "}\n{ (CHARACTERISTICS): Diet =", this.characteristics.diet,
            " / Metabolism =", this.characteristics.metabolism,
            " / Visibility =", this.characteristics.visibility,
            " / Detection =", this.characteristics.detection,
            " / Mobility =", this.characteristics.mobility,
            " / Speed =", this.characteristics.speed,
            " / Strength =", this.characteristics.strength, "}"].join(" ");
    }
}
