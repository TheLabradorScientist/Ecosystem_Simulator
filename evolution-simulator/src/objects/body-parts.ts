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

export function limbsToString(l: Limbs): string {
	return ["Forelimb: ", l.forelimbShape.name, " / ",
		"Hindlimb: ", l.hindlimbShape.name, " / ",
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

export function headToString(h: Head): string {
	return ["Teeth: ", h.teeth.name, " / ",
		"Eyes: ", h.eyes.name, " / ",
		"Facial Structure: ", h.nose.name, " / ",
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

export function torsoToString(t: Torso): string {
	return ["Build: ", t.build.name, " / ",
		"Patterns: ", t.patterns.name, " / ",
		"Exterior: ", t.skin.name, " / ",
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

export function tailToString(t: Tail): string {
	return "Tail: " + t.tail.name
};