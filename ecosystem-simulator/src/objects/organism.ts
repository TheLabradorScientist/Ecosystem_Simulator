import { Trait, eyes } from "./trait";
import { DrawSector, GetRelativePosition, RandomOrientation, Target, oppositeOrientation, orientationMap } from "../helpers/geometry";
import { detectionTraits, dietTraits, mobilityTraits, speedTraits, strengthTraits, visibilityTraits } from "../helpers/trait-maps";
import { Characteristics } from "../interfaces/characteristics";
import { Detector } from "../interfaces/detector";
import { Head, Limbs, Part, Tail, Torso, torsoToString, headToString, limbsToString, tailToString, headParts, torsoParts, limbParts, CloneLimbs, CloneHead, CloneTorso, CloneTail } from "./body-parts";
import { Info } from "./basicInfo";
import { Meat, Plant } from "../interfaces/food";
import { GameScene, populationMap } from "../scenes/game-scene";
import { CloneOrganism } from "../helpers/organism-builders";

export class Organism extends Phaser.GameObjects.GameObject { 
    head: Head;
    torso: Torso;
    limbs: Limbs;
    tail: Tail;
    phenotype: Map<Part, Trait>;
    
    private hunger: number;
    private energy: number; // Determines the probability that the organism will move.
    // Recovered over time if hunger < 3/4 metabolism. Max = metabolism value.
    private age: number;
    
    size: number;
    color: number;
    drawnParts: Phaser.GameObjects.Group;
    populationID: number;

    private characteristics: Characteristics;
    private target: Target;
    private targetLock: boolean;
    private info: Info;
    private canMate: boolean;
    private rep_interval: number;
    status: number;

    // As food
    nutritionCap: number;

    detector: Detector;
    
    body: Phaser.Physics.Arcade.Body;

    scene: GameScene;
    sceneBounds: Phaser.Geom.Rectangle;
    rect: Phaser.GameObjects.Rectangle;
    orientation: string;

    constructor(scene: Phaser.Scene, rect: Phaser.GameObjects.Rectangle, bounds: Phaser.Geom.Rectangle,
        popID: number, newColor: number, newSize: number, newHead: Head, newTorso: Torso, newLimbs: Limbs, newTail: Tail)
    {
		super(scene, 'sprite');
        this.sceneBounds = bounds;
		this.rect = rect;
		this.orientation = RandomOrientation();
        this.populationID = popID;

        this.color = newColor; // TODO: Should be used to scale the organism's base color
        // Size 0 = 80 x 80
        this.size = newSize // Might be edited later to implement age
                            // Max size at a certain age, until which
                            // the organism keeps growing larger.

        this.nutritionCap = 100 + (5*this.size);

        this.rect.setRotation(orientationMap.get(this.orientation));
        this.rect.setScale(1 + (this.size/20));
		// Phaser.GameObjects.Components.Transform.rotation -- use for orienting organisms

        this.drawnParts = new Phaser.GameObjects.Group(this.scene);
        this.head = newHead;
        this.torso = newTorso;
        this.limbs = newLimbs;
        this.tail = newTail;
        this.phenotype = new Map<Part, Trait>([])

        this.hunger = 0;
        this.age = 0;
        this.target = {object: null, objectBounds: null, relationship: 0, type: null};
        this.targetLock = false;

        this.MapTraits(headParts, this.head.traits);
        this.MapTraits(torsoParts, this.torso.traits);
        this.MapTraits(limbParts, this.limbs.traits);
        this.phenotype.set("Tail", this.tail.tail);
        this.characteristics = {diet: 0, metabolism: 0, mobility: 0, visibility: 0, detection: 0, speed: 0, strength: 0}
        this.characteristics.diet = this.CalculateCharacteristic(dietTraits);
        this.characteristics.metabolism = 100;
        this.characteristics.visibility = this.CalculateCharacteristic(visibilityTraits);
        this.characteristics.detection = this.CalculateCharacteristic(detectionTraits);
        this.characteristics.mobility = this.CalculateCharacteristic(mobilityTraits);

        // Medium sized animals are the fastest
        this.characteristics.speed = this.CalculateCharacteristic(speedTraits) + (5-Math.abs(this.size));

        this.characteristics.strength = this.CalculateCharacteristic(strengthTraits);

        this.canMate = false;
        this.rep_interval = 10 + this.characteristics.diet;

        this.energy = this.characteristics.metabolism;

        this.detector = new Detector(this.rect, this.characteristics.detection);

        this.rect.setInteractive();
        this.scene.add.existing(this);
        this.status = 1;

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

    // General update of Organism's state
    Update() {
        // Increment hunger; greater for herbivores than carnivores
        this.hunger += 0.035 - (this.characteristics.diet/750)

        // Increment age
        this.age+=0.01;

        // Call death via starvation
        if (this.hunger > this.characteristics.metabolism) {
            this.Die();
        }

        // Call death via old age
        if (this.age > 120) {
            this.Die();
        }

        // Update organism mating conditions
        // First, check if both unable to and old enough
        if (this.canMate == false && this.age >= 20) {
            // Check if reproduction interval is complete.
            if (this.rep_interval <= 0) {
                // If so, set true and reset interval
                this.canMate = true;
                // Max Carnivore = 40 days, Max herbivore = 20 days
                this.rep_interval = 30 + this.characteristics.diet;
            } else {
                // Decrement interval.
                this.rep_interval-= 0.01;
            }
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
                    console.log("Target locked: ", this.target.type)
                    this.targetLock = true; 
                } else {
                    this.target = {object: null, objectBounds: null, relationship: 0, type: null};
                    return;
                }
            }

            let rectBounds = this.rect.getBounds();

            // Get unstuck
            if (this.rect.x <= 0 || this.rect.y <= 0 || this.rect.x >= this.sceneBounds.width || this.rect.y >= this.sceneBounds.height ) {
                this.TurnTo(GetRelativePosition(this.rect.getBounds(), this.sceneBounds));
                this.Move();
                this.target = {object: null, objectBounds: null, relationship: 0, type: null};
                this.targetLock = false;
                return;
            }

            if (this.target.relationship > 0) {
                // Approach food
                this.TurnTo(GetRelativePosition(this.rect.getBounds(), this.target.objectBounds));
                if ((Math.abs(rectBounds.centerX - this.target.objectBounds.centerX) > 40) || 
                (Math.abs(rectBounds.centerY - this.target.objectBounds.centerY) > 40)) {
                    this.Move();
                    //console.log(this.targetLock, ' locked on ', this.target.relationship)
                    //console.log("Organism coordinates: ", this.rect.x, this.rect.y);   
                } else { // Reached food / mate
                    if (this.target.type == 'food') {
                        // If organism, chance of hunt being unsuccessful
                        if (this.target.object instanceof Organism) {
                            if (Phaser.Math.Between(0, 4) == 1) {
                                this.Eat();
                            }
                        } else {
                            this.Eat();
                        }
                    } else if (this.target.type == 'mate' && this.target.object instanceof Organism) {
                        if (this.age > 20 && this.canMate == true && this.target.object.age > 20 && this.target.object.canMate == true) {
                            // Could possibly randomize number of offspring - maybe 1-3
                            let randNum = Phaser.Math.Between(1, 3);
                            let pop = populationMap.get(this.populationID);
                            for (let x = 0; x < randNum; x++) {
                                let newOrg = CloneOrganism(this.scene, this.rect.x, this.rect.y, this);
                                newOrg.status = 0;
                                pop.livingIndividuals.push(newOrg);
                            }
                            pop.updateNeeded = true;
                            this.target.object.canMate = false;
                            this.canMate = false;
                        }
                    }
                    this.target = {object: null, objectBounds: null, relationship: 0, type: null};
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
                    this.target = {object: null, objectBounds: null, relationship: 0, type: null};
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
        //this.target.object -- update function that reduces nutrition
        if (this.target.object instanceof Organism) {
            this.target.object = this.target.object.Die();
        }

        if (this.target.object instanceof Plant || this.target.object instanceof Meat) {
            if (this.hunger <= this.target.object.currNutrition) {
                this.target.object.currNutrition -= this.hunger;
                this.hunger = 0;
            } else {
                this.hunger -= this.target.object.currNutrition;
                this.target.object.currNutrition = 0;
            }

        }
        this.energy = this.characteristics.metabolism-this.hunger;
        console.log("Target dropped: Food")
    }

    MapTraits(partType: string[], traits: Trait[]) {
        traits.forEach((trait: Trait, x: number) => {
            this.phenotype.set(partType[x], trait);
        })
    }

    CalculateCharacteristic(reference: Map<string, number>): number {
        let value = 0
        this.phenotype.forEach((trait: Trait) => {
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
                if (!eyes.includes(trait.name)) {
                    trait.setTint(this.color);
                }
                
                this.drawnParts.add(this.scene.add.existing(trait));
            }
        })

        this.detector.sectorGraphic = DrawSector(this.detector.sectorGraphic, this.detector.sector)
    }

    Sense(object: null | Phaser.GameObjects.Image | Plant | Meat | Organism) {   
        //console.log(this.detector.detectedObjects);  
        if (object != null) {
            let objectBounds: Phaser.Geom.Rectangle;
            if (object instanceof Organism) {
                objectBounds = object.rect.getBounds();
                if (this.checkIfPredator(object)) {
                    let rel = -10; // TODO: calculate
                    // Set your priorities in life >:)
                    if (Math.abs(rel) > this.target.relationship) {
                        this.target = {object: object, objectBounds: objectBounds, relationship: rel, type: 'predator'};
                    }
                    return;
                } else if (this.checkIfMate(object)) {
                    let rel = +5;
                    if (Math.abs(rel) > this.target.relationship) {
                        this.target = {object: object, objectBounds: objectBounds, relationship: rel, type: 'mate'}
                    }
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
                        this.target = {object: object, objectBounds: objectBounds, relationship: rel, type: 'food'};
                    }
                }
                return;
            }
        }
    }

    checkIfFood(obj: Phaser.GameObjects.Image | Plant | Meat | Organism): boolean {
        if (obj instanceof Plant) {
            // Diet <= 0 -> always food
            // Diet 7+ -> never food
            // Diet 1-6 -> probability, more likely with high hunger
            if (this.characteristics.diet + Phaser.Math.Between(4, 6) - (4*this.hunger/this.characteristics.metabolism) < 7) {
                this.detector.detectedObjects.shift();
                return true;   
            }
        }

        if (obj instanceof Meat) {
            // Diet <= 0 -> always food
            // Diet 7+ -> never food
            // Diet 1-6 -> probability, more likely with high hunger
            if (this.characteristics.diet - Phaser.Math.Between(4, 6) + (4*this.hunger/this.characteristics.metabolism) > -7) {
                this.detector.detectedObjects.shift();
                return true;   
            }            
        }
        
        if (obj instanceof Organism) {
            // Diet >= 0 -> always food
            // Diet -7- -> never food
            // Diet -1-6 -> probability, more likely with high hunger
            if (this.characteristics.diet - Phaser.Math.Between(4, 6) + (4*this.hunger/this.characteristics.metabolism) > -7) {
                if (obj.characteristics.strength < this.characteristics.strength) {
                    console.log("Prey!");
                    this.detector.detectedObjects.shift();
                    return true;
                }
            }
        }
        return false;

        // if checkIfFood => true, then set target with + relationship, dependent
        // on hunger. Lower hunger = closer to neutral (0). If prey = other
        // organism, then check relative strength and weigh against hunger.
    }


    checkIfMate(obj: Organism): boolean {
        if (obj.populationID == this.populationID && this.canMate == true) {
            this.detector.detectedObjects.shift()
            return true;
        } else {
            return false;
        }
    }

    checkIfPredator(obj: Organism): boolean {
        if (Phaser.Math.Between(-2, 4) + obj.characteristics.diet > 7 && obj.characteristics.strength > this.characteristics.strength) {
            this.detector.detectedObjects.shift()
            return true;
        } else {
            return false;
        }

        //if checkIfPredator => true, then set target with - relationship,
        // dependent on strength vs speed. Low speed, high strength
        // => closer to neutral (0). Maybe separate method for calculating
        // probability of fight or flight. Maybe aggression variable will
        // mean + relationship target even if predator = true.
    }

    Die(): Meat {
        let pop = populationMap.get(this.populationID);
        this.status = -1;
        pop.updateNeeded = true;
        let remains = this.scene.createCarrion(this.rect.x, this.rect.y, this.nutritionCap)
        this.drawnParts.destroy(true, true);
        this.detector.sectorGraphic.destroy(true);
        this.info.infoDisplay.destroy(true);
        this.info.off('pointerdown');
        this.rect.off('pointerdown');
        this.info.destroy(true);
        this.destroy(true);
        return remains;
    }

    toString(): string {
        return ["ORGANISM:\n [AGE] = ", Math.round(this.age), "DAYS, [HUNGER] = ", Math.round(this.hunger), "\n",
            "{ (HEAD):", headToString(this.head), "}\n{",
            "(TORSO): ", torsoToString(this.torso), "}\n{",
            "(LIMBS): ", limbsToString(this.limbs), "}\n{",
            "(TAIL): ", tailToString(this.tail), " }",
            "\n{ (CHARACTERISTICS): \n+ Diet =", this.dietString(this.characteristics.diet), this.characteristics.diet,
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
            return "Obligate herbivore";
        } else if (diet < -3) {
            return "Facultative herbivore";
        } else if (diet > 7) {
            return "Obligate carnivore";
        } else if (diet > 3) {
            return "Facultative carnivore";
        } else {
            return "True omnivore";
        }
    }
}
