import { SpriteConstructor } from "../interfaces/sprite-interface";

export class Trait extends Phaser.GameObjects.Sprite {
	name: string;
    scene: Phaser.Scene;
    rect: Phaser.GameObjects.Rectangle;
    isDrawable: boolean;

	body: Phaser.Physics.Arcade.Body

	// Scales to height/width of rectangle. Scale factor derived from rect.
    constructor(aParams: SpriteConstructor) {
		super(aParams.scene, aParams.rect.x, aParams.rect.y, aParams.texture);
		this.rect = aParams.rect;
		// Phaser.GameObjects.Components.Transform.rotation -- use for orienting organisms
		this.name = aParams.texture;
		this.body;
		this.makeTrait(aParams.texture);
    }

	private makeTrait(texture: string) {
		if (drawableTraits.includes(texture)) {
			this.isDrawable = true;
		} else {
			this.isDrawable = false;
		}
	}
};



// Absent body parts decrease visibility- ideal for ambush carnivores (ie snakes).
export const teeth = ["sharp canines", "flat molars", "mixed teeth"];
export const eyes  = ["front, slit pupils", "sides, horizontal pupils", "small, round pupils", "large, round pupils"];   // Drawn
export const nose  = ["nostrils", "short muzzle", "long snout", "beak"];                                                 // Drawn
export const ears  = ["no external ears", "forward, triangular ears", "large, movable ears", "small, streamlined ears"]; // Drawn
// tusks ? horns ? antlers ? - all increase visibility 

export const build    = ["lithe", "bulky", "average"];         // Drawn
export const size     = ["small", "medium", "large"];          // Applied to image using size factor. May be replaced with rand number generation -10 to 10.
export const patterns = ["stripes", "spots", "plain"];       5  /// Stripes blend with grass, spots blend with forest // Drawn
export const skin     = ["skin", "scales", "feathers", "fur"]; // Wings -> feathers
export const gut      = ["short, simple", "long, chambered"];

export const forelimbShape = ["arms/legs", "arms/legs", "arms/legs", "wings", "fins", "no forelimbs"];         // Drawn
export const extremity     = ["no extremities", "claws", "paws", "hands", "hooves"]; // Randomized, ONLY ACCESSED IF LIMBS = ARM/LEG // Drawn

export const hindlimbShape = ["legs", "talons", "hindfins", "no hindlimbs"]; // hindlimb = absent or fin if forelimb = fin, leg if forelimb = leg or wing, absent if forelimb absent
// hindlimb extremity - same as forelimb // Drawn

export const tail = ["no tail", "stub", "tailfeathers", "tailfin", "prehensile"]; // Probabilities predefined // Drawn

export const drawableTraits = [
    "front, slit pupils", 
    "sides, horizontal pupils", 
    "small, round pupils",
    "large, round pupils",
    "nostrils", 
    "short muzzle",
    "long snout", 
    "beak", 
    "forward, triangular ears",
    "large, movable ears",
    "small, streamlined ears", 
    "lithe",
    "bulky",
    "average",
    "stripes", 
    "spots", 
    "arms/legs", 
    "wings",
    "fins", 
    "claws", 
    "paws", 
    "hands",  
    "hooves", 
    "legs",  
    "talons", 
    "hindfins", 
    "stub", 
    "tailfeathers", 
    "tailfin", 
    "prehensile",
];


// Organism.Draw function calls part.Draw
// For each part, if map[part] != nil then draw part
/* 
export const traitImages = new Map<string, string>([
	// EYES
	["front, slit pupils", "eyes_slit.png"],
	["sides, horizontal pupils", "eyes_horizontal.png"],
	["small, round pupils", "eyes_smallR.png"],
	["large, round pupils", "eyes_largeR.png"], // Drawn

	// FACIAL STRUCTURES
	["nostrils",     "face_nostrils.png"],
	["short muzzle", "face_muzzle.png"],
	["long snout",   "face_snout.png"],
	["beak",         "face_beak.png"], // Drawn

	//EARS
	//"no external ears",
	["forward, triangular ears", "ears_triangle.png"],
	["large, movable ears",      "ears_large.png"],
	["small, streamlined ears",  "ears_small.png"], // Drawn
	// tusks ? horns ?

	// BUILD
	["lithe",   "build_lithe.png"],
	["bulky",   "build_bulky.png"],
	["average", "build_average.png"], // Drawn

	// PATTERNS
	["stripes", "pattern_stripes.png"],
	["spots",   "pattern_spots.png"],
	//"plain", // Drawn

	// FORELIMBS
	["arms/legs", "foreleg.png"],
	["wings",     "forewing.png"],
	["fins",     "forefin.png"],
	//"no forelimbs", // Drawn

	// EXTREMITIES
	//"no extremities",
	["claws",  "extr_claws.png"],
	["paws",  "extr_paws.png"],
	["hands",  "extr_hands.png"],
	["hooves", "extr_hooves.png"], // Drawn

	// HINDLIMBS
	["legs",     "hindleg.png"],
	["talons",   "hindtalon.png"],
	["hindfins", "hindfin.png"],
	//"no hindlimbs", // Drawn

	// TAIL
	//"no tail",
	["stub",       "tail_stub.png"],
	["tailfeathers",   "tail_feathers.png"],
	["tailfin",    "tail_fin.png"],
	["prehensile", "tail_prehensile.png"], // Drawn
])
 */