import { Trait, build, ears, extremity, eyes, forelimbShape, gut, hindlimbShape, nose, patterns, size, skin, tail, teeth } from "../assets/sprites/trait";
import { Randomize, position } from "../helpers/geometry";

export const limbParts = ["Forelimb", "Hindlimb", "Extremity"];

export interface Part {}

export interface Limbs extends Part {
	traits:        Trait[]
	forelimbShape: Trait
	hindlimbShape: Trait
	extremity:     Trait
};

export function NewLimbs(scene: Phaser.Scene, pos: position, orient: string): Limbs {
    let defaultRect = {center: pos, width: 80, height: 80};
    let newForelimbShape = new Trait({ scene: scene, texture: Randomize(forelimbShape), rect: defaultRect, orientation: orient });
	let newHindlimbShape: Trait;
    let newExtremity: Trait;
    switch (newForelimbShape.name) {
	case "fins":
		newHindlimbShape = new Trait({ scene: scene, texture: Randomize(hindlimbShape.slice(2)), rect: defaultRect, orientation: orient });
		newExtremity = new Trait({ scene: scene, texture: "no extremities", rect: defaultRect, orientation: orient });
        break;
    case "wings":
		newHindlimbShape = new Trait({ scene: scene, texture: "talons", rect: defaultRect, orientation: orient });
		newExtremity = new Trait({ scene: scene, texture: "no extremities", rect: defaultRect, orientation: orient });
        break;
    //case "absent": no change
	case "arms/legs":
		newHindlimbShape = new Trait({ scene: scene, texture: "legs", rect: defaultRect, orientation: orient });
		newExtremity = new Trait({ scene: scene, texture: Randomize(extremity.slice(1)), rect: defaultRect, orientation: orient });
        break;
    default:
		newHindlimbShape = new Trait({ scene: scene, texture: "no hindlimbs", rect: defaultRect, orientation: orient });
		newExtremity = new Trait({ scene: scene, texture: "no extremities", rect: defaultRect, orientation: orient });
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

export function NewHead(scene: Phaser.Scene, pos: position, orient: string): Head {
	let defaultRect = {center: pos, width: 80, height: 80};
    let newTeeth = new Trait({ scene: scene, texture: Randomize(teeth), rect: defaultRect, orientation: orient });
	let newEyes = new Trait({ scene: scene, texture: Randomize(eyes), rect: defaultRect, orientation: orient });
	let newNose = new Trait({ scene: scene, texture: Randomize(nose), rect: defaultRect, orientation: orient });
	let newEars = new Trait({ scene: scene, texture: Randomize(ears), rect: defaultRect, orientation: orient });
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

export const torsoParts = ["Build", "Size", "Patterns", "Skin", "Gut"];

export interface Torso extends Part {
	traits:   Trait[]
	build:    Trait
	size:     Trait
	patterns: Trait
	skin:     Trait
	gut:      Trait
};

export function NewTorso(scene: Phaser.Scene, pos: position, orient: string): Torso {
	let defaultRect = {center: pos, width: 80, height: 80};
	let newBuild = new Trait({ scene: scene, texture: Randomize(build), rect: defaultRect, orientation: orient });
	let newSize = new Trait({ scene: scene, texture: Randomize(size), rect: defaultRect, orientation: orient });
	let newPatterns = new Trait({ scene: scene, texture: Randomize(patterns), rect: defaultRect, orientation: orient });
	let newSkin = new Trait({ scene: scene, texture: Randomize(skin), rect: defaultRect, orientation: orient });
	let newGut = new Trait({ scene: scene, texture: Randomize(gut), rect: defaultRect, orientation: orient });
	let traitsArray = [newBuild, newSize, newPatterns, newSkin, newGut];
	return {
		build:    newBuild,
		size:     newSize,
		patterns: newPatterns,
		skin:     newSkin,
		gut:      newGut,
		traits:   traitsArray,
	};
};

export function torsoToString(t: Torso): string {
	return ["Build: ", t.build.name, " / ",
		"Size: ", t.size.name, " / ",
		"Patterns: ", t.patterns.name, " / ",
		"Exterior: ", t.skin.name, " / ",
		"Digestive System: ", t.gut.name].join(" ")
};

export interface Tail extends Part {
	tail: Trait
};

export function NewTail(scene: Phaser.Scene, pos: position, orient: string): Tail {
	let defaultRect = {center: pos, width: 80, height: 80};
	let newTail = new Trait({ scene: scene, texture: Randomize(tail), rect: defaultRect, orientation: orient });
	return {
		tail: newTail,
	}
};

export function tailToString(t: Tail): string {
	return "Tail: " + t.tail.name
};