import { Trait, build, ears, extremity, eyes, forelimbShape, gut, hindlimbShape, nose, patterns, skin, tail, teeth } from "./trait";
import { Randomize } from "../helpers/geometry";

export const limbParts = ["Forelimb", "Hindlimb", "Extremity"];

export interface Part {
	//traits: 		Trait[]; Tail does not have array...
}

export interface Limbs extends Part {
	traits:        Trait[]
	forelimbShape: Trait
	hindlimbShape: Trait
	extremity:     Trait
};

export function NewLimbs(rect: Phaser.GameObjects.Rectangle): Limbs {
    let newForelimbShape = new Trait({ scene: rect.scene, texture: Randomize(forelimbShape), rect: rect });
	let newHindlimbShape: Trait;
    let newExtremity: Trait;
    switch (newForelimbShape.name) {
	case "fins":
		newHindlimbShape = new Trait({ scene: rect.scene, texture: Randomize(hindlimbShape.slice(2)), rect: rect });
		newExtremity = new Trait({ scene: rect.scene, texture: "no extremities", rect: rect });
        break;
    case "wings":
		newHindlimbShape = new Trait({ scene: rect.scene, texture: "talons", rect: rect });
		newExtremity = new Trait({ scene: rect.scene, texture: "no extremities", rect: rect });
        break;
    //case "absent": no change
	case "arms/legs":
		newHindlimbShape = new Trait({ scene: rect.scene, texture: "legs", rect: rect });
		newExtremity = new Trait({ scene: rect.scene, texture: Randomize(extremity.slice(1)), rect: rect });
        break;
    default:
		newHindlimbShape = new Trait({ scene: rect.scene, texture: "no hindlimbs", rect: rect });
		newExtremity = new Trait({ scene: rect.scene, texture: "no extremities", rect: rect });
        break;
    }
	let traitsArray = [newForelimbShape, newHindlimbShape, newExtremity];
	return {
		forelimbShape: newForelimbShape,
		hindlimbShape: newHindlimbShape,
		extremity:     newExtremity,
		traits:        traitsArray,
	}
};

export function CloneLimbs(scene: Phaser.Scene, rect: Phaser.GameObjects.Rectangle, original: Limbs): Limbs {
    let newForelimbShape = new Trait({ scene: scene, texture: original.forelimbShape.name, rect: rect });
	let newHindlimbShape = new Trait({ scene: scene, texture: original.hindlimbShape.name, rect: rect });

    let newExtremity = new Trait({ scene: scene, texture: original.extremity.name, rect: rect });

	let traitsArray = [newForelimbShape, newHindlimbShape, newExtremity];

	return {
		forelimbShape: newForelimbShape,
		hindlimbShape: newHindlimbShape,
		extremity:     newExtremity,
		traits:        traitsArray,
	}
};

export function limbsToString(l: Limbs): string {
	return ["Forelimb: ", l.forelimbShape.name, " \n+ ",
		"Hindlimb: ", l.hindlimbShape.name, " \n+ ",
		"Extremity: ", l.extremity.name].join(" ");
};

export const headParts = ["Teeth", "Eyes", "Nose", "Ears"];

export interface Head extends Part {
	traits: Trait[]
	teeth:  Trait
	eyes:   Trait
	nose:   Trait
	ears:   Trait
};

export function NewHead(rect: Phaser.GameObjects.Rectangle): Head {
    let newTeeth = new Trait({ scene: rect.scene, texture: Randomize(teeth), rect: rect });
	let newEyes = new Trait({ scene: rect.scene, texture: Randomize(eyes), rect: rect });
	let newNose = new Trait({ scene: rect.scene, texture: Randomize(nose), rect: rect });
	let newEars = new Trait({ scene: rect.scene, texture: Randomize(ears), rect: rect });
	let traitsArray = [newTeeth, newEyes, newNose, newEars];
	return {
		teeth:  newTeeth,
		eyes:   newEyes,
		nose:   newNose,
		ears:   newEars,
		traits: traitsArray,
	}
};

export function CloneHead(scene: Phaser.Scene, rect: Phaser.GameObjects.Rectangle, original: Head): Head {
    let newTeeth = new Trait({ scene: scene, texture: original.teeth.name, rect: rect });
	let newEyes = new Trait({ scene: scene, texture: original.eyes.name, rect: rect });
	let newNose = new Trait({ scene: scene, texture: original.nose.name, rect: rect });
	let newEars = new Trait({ scene: scene, texture: original.ears.name, rect: rect });

	let traitsArray = [newTeeth, newEyes, newNose, newEars];
	
	return {
		teeth:  newTeeth,
		eyes:   newEyes,
		nose:   newNose,
		ears:   newEars,
		traits: traitsArray,
	}
};

export function headToString(h: Head): string {
	return ["Teeth: ", h.teeth.name, " \n+ ",
		"Eyes: ", h.eyes.name, " \n+ ",
		"Facial Structure: ", h.nose.name, " \n+ ",
		"Ears: ", h.ears.name].join(" ")
};

export const torsoParts = ["Build", "Patterns", "Skin", "Gut"];

export interface Torso extends Part {
	traits:   Trait[]
	build:    Trait
	patterns: Trait
	skin:     Trait
	gut:      Trait
};

export function NewTorso(rect: Phaser.GameObjects.Rectangle): Torso {
	let newBuild = new Trait({ scene: rect.scene, texture: Randomize(build), rect: rect });
	let newPatterns = new Trait({ scene: rect.scene, texture: Randomize(patterns), rect: rect });
	let newSkin = new Trait({ scene: rect.scene, texture: Randomize(skin), rect: rect });
	let newGut = new Trait({ scene: rect.scene, texture: Randomize(gut), rect: rect });
	let traitsArray = [newBuild, newPatterns, newSkin, newGut];
	return {
		build:    newBuild,
		patterns: newPatterns,
		skin:     newSkin,
		gut:      newGut,
		traits:   traitsArray,
	};
};

export function CloneTorso(scene: Phaser.Scene, rect: Phaser.GameObjects.Rectangle, original: Torso): Torso {
    let newBuild = new Trait({ scene: scene, texture: original.build.name, rect: rect });
	let newPatterns = new Trait({ scene: scene, texture: original.patterns.name, rect: rect });
	let newSkin = new Trait({ scene: scene, texture: original.skin.name, rect: rect });
	let newGut = new Trait({ scene: scene, texture: original.gut.name, rect: rect });

	let traitsArray = [newBuild, newPatterns, newSkin, newGut];
	
	return {
		build:    newBuild,
		patterns: newPatterns,
		skin:     newSkin,
		gut:      newGut,
		traits:   traitsArray,
	}
};

export function torsoToString(t: Torso): string {
	return ["Build: ", t.build.name, " \n+ ",
		"Patterns: ", t.patterns.name, " \n+ ",
		"Exterior: ", t.skin.name, " \n+ ",
		"Digestive System: ", t.gut.name].join(" ")
};

export interface Tail extends Part {
	tail: Trait
};

export function NewTail(rect: Phaser.GameObjects.Rectangle): Tail {
	let newTail = new Trait({ scene: rect.scene, texture: Randomize(tail), rect: rect });
	return {
		tail: newTail,
	}
};

export function CloneTail(scene: Phaser.Scene, rect: Phaser.GameObjects.Rectangle, original: Tail): Tail {
    let newTail = new Trait({ scene: scene, texture: original.tail.name, rect: rect });
	return {
		tail: newTail,
	}
};

export function tailToString(t: Tail): string {
	return "Tail: " + t.tail.name
};