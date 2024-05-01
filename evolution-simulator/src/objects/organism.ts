import { Trait } from "./trait";
import { DrawSector, GetRelativePosition, RandomOrientation, Target, oppositeOrientation, orientationMap } from "../helpers/geometry";
import { detectionTraits, dietTraits, mobilityTraits, speedTraits, strengthTraits, visibilityTraits } from "../helpers/trait-maps";
import { Characteristics } from "../interfaces/characteristics";
import { Detector } from "../interfaces/detector";
import { Head, Limbs, NewTorso, NewHead, NewLimbs, NewTail, Part, Tail, Torso, torsoToString, headToString, limbsToString, tailToString, headParts, torsoParts, limbParts } from "./body-parts";
import { Info } from "./basicInfo";

export class Organism extends Phaser.GameObjects.GameObject {
    private head: Head;
    private torso: Torso;
    private limbs: Limbs;
    private tail: Tail;
    drawnParts: Phaser.GameObjects.Group;
    private parts: Map<Part, Trait>;
    private size: number;
    private color: number;
    private hunger: number;

    private energy: number; // Determines the probability that the organism will move.
            // Recovered over time if hunger < 3/4 metabolism. Max = metabolism value.

    private age: number;
    private characteristics: Characteristics;
    private target: Target;
    private targetLock: boolean;
    private info: Info;

    detector: Detector;
    
    body: Phaser.Physics.Arcade.Body;

    scene: Phaser.Scene;
    sceneBounds: Phaser.Geom.Rectangle;
    rect: Phaser.GameObjects.Rectangle;
    orientation: string;

    constructor(scene: Phaser.Scene, rect: Phaser.GameObjects.Rectangle, bounds: Phaser.Geom.Rectangle) {
		super(scene, 'sprite');
        this.sceneBounds = bounds;
		this.rect = rect;
		this.orientation = RandomOrientation();

        this.color = 0xffffff; // TODO: Should be used to scale the organism's base color
        // Size 0 = 80 x 80
        this.size = Phaser.Math.Between(-5, 5); // Might be edited later to implement age
                                                // Max size at a certain age, until which
                                                // the organism keeps growing larger.

        this.rect.setRotation(orientationMap.get(this.orientation));
        this.rect.setScale(1 + (this.size/20));
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

        // Medium sized animals are the fastest
        this.characteristics.speed = this.CalculateCharacteristic(speedTraits) + (5-Math.abs(this.size));

        this.characteristics.strength = this.CalculateCharacteristic(strengthTraits);

        this.energy = this.characteristics.metabolism;

        this.detector = new Detector(this.rect, this.characteristics.detection);

        this.rect.setInteractive();
        this.scene.add.existing(this);

        this.setupEventListeners();
        this.info = new Info({ 
            scene: this.scene, texture: 'info', 
            rect: new Phaser.GameObjects.Rectangle(this.scene, 400, 300, 400, 500)}, 
            this.toString()).setVisible(false).setDepth(5);
    }
    private setupEventListeners() {
        this.rect.on('pointerdown', () => {
            this.info.infoText = this.toString();
            this.info.setVisible(true);
            this.info.infoDisplay.text = this.info.infoText;
            this.info.infoDisplay.setVisible(true);
            //console.log(true)
        })
    }


    Update() {
        this.hunger+=0.05;
        this.age++;
        if (this.hunger >= this.characteristics.metabolism) {
            //this.Die();
        }
    }

    TurnTo(orient: string) {
        this.orientation = orient;
        this.rect.rotation = orientationMap.get(this.orientation);
        this.detector.sector.orientation = this.rect.rotation;        
    }

    Act() {
        if (this.target.object == null) {
            let rand = Phaser.Math.Between(0, 60);
            if (rand < 2) {
                this.TurnTo(RandomOrientation());
                if (this.hunger < this.characteristics.metabolism*3/4 && this.energy < this.characteristics.metabolism) {
                    this.energy++;
                }
            } else if (rand < 10) {
                if (this.rect.x <= 0 || this.rect.y <= 0 || this.rect.x >= this.sceneBounds.width || this.rect.y >= this.sceneBounds.height ) {
                    this.TurnTo(GetRelativePosition(this.rect.getBounds(), this.sceneBounds));
                }
                this.Move();

                // IDEA: Alternative function GetUnstuck() sets organism's target
                // to the center of the scene (sceneBounds centerX, center Y) &
                // results in organism moving to center until no longer offscreen.
                // Target = sceneBounds, relationship = +10
            } else {
                if (this.hunger < this.characteristics.metabolism*3/4 && this.energy < this.characteristics.metabolism) {
                    this.energy++;
                }
                return; 
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

            let rectBounds = this.rect.getBounds();

            if (this.target.relationship > 0) {
                // Approach food
                this.TurnTo(GetRelativePosition(this.rect.getBounds(), this.target.objectBounds));
                if ((Math.abs(rectBounds.centerX - this.target.objectBounds.centerX) > 80) || (Math.abs(rectBounds.centerY - this.target.objectBounds.centerY) > 80)) {
                    this.Move();
                    //console.log(this.targetLock, ' locked on ', this.target.relationship)
                    //console.log("Organism coordinates: ", this.rect.x, this.rect.y);   
                } else {
                    this.Eat();
                    this.target = {object: null, objectBounds: null, relationship: 0};
                    this.targetLock = false;
                }
            } else { // relationship < 0
                // Flee from predator
                this.TurnTo(oppositeOrientation.get(GetRelativePosition(this.rect.getBounds(), this.target.objectBounds)));
                if ((Math.abs(rectBounds.centerX - this.target.objectBounds.centerX) < 240) || (Math.abs(rectBounds.centerY - this.target.objectBounds.centerY) < 240)) {
                    this.Move();
                    //console.log(this.targetLock, ' locked on ', this.target.relationship)
                    //console.log("Organism coordinates: ", this.rect.x, this.rect.y);   
                } else {
                    this.target = {object: null, objectBounds: null, relationship: 0};
                    this.targetLock = false;
                }
            }
            
        }
    }

    Move() {
        // Maybe make movement affected by energy
        //console.log(this.energy, "/", this.characteristics.metabolism, "=", this.energy/this.characteristics.metabolism );
        const movement = (10 + this.characteristics.speed/2)* this.energy/this.characteristics.metabolism;
        if (movement < 0) {            
            if (this.hunger < this.characteristics.metabolism*3/4 && this.energy < this.characteristics.metabolism) {
                this.energy++;
            }
            return;
        }
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
        this.energy-=0.25;
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
                trait.scale = trait.rect.scale;
                
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
                //console.log("Hunger probability: ", this.hunger/this.characteristics.metabolism)
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
            "(TAIL): ", tailToString(this.tail), " }",
            "\n{ (CHARACTERISTICS): \n+ Diet =", this.dietString(this.characteristics.diet),
            " \n+ Metabolism =", this.characteristics.metabolism,
            " \n+ Visibility =", this.characteristics.visibility,
            " \n+ Detection =", this.characteristics.detection,
            " \n+ Mobility =", this.characteristics.mobility,
            " \n+ Size =", ((6 + this.size)*4/5), "ft",
            " \n+ Top Speed =", (40 + (this.characteristics.speed*3)), "mph",
            " \n+ Strength =", this.characteristics.strength, "}"].join(" ");
    }

    dietString(diet: number): string {
        if (diet < -7) {
            return "Obligate carnivore";
        } else if (diet < -3) {
            return "Facultative carnivore";
        } else if (diet > 7) {
            return "Obligate herbivore";
        } else if (diet > 3) {
            return "Facultative herbivore";
        } else {
            return "True omnivore";
        }
    }
}
