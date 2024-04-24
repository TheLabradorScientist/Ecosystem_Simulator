// Position type
export type position = { x: number; y: number}

// Target type // Relationship from -10 (AVOID) to 0 (NEUTRAL) to +10 (APPROACH)
// Relationship values determined by hunger if food, strength if predator (fight vs flight)
// Closer to 0 = more neutral, more likely to stop avoiding/approaching sooner.
export type Target = { 
    object: Phaser.GameObjects.GameObject, 
    objectBounds: Phaser.Geom.Rectangle,
    relationship: number }

// Sector type
export interface Sector {
    center: position;
    radius: number;
    percent: number;
    orientation: number;
}
// Draw Sector https://newdocs.phaser.io/docs/3.55.2/Phaser.GameObjects.Arc (object collision method)
export function DrawSector(graphics: Phaser.GameObjects.Graphics, sector: Sector) {
    graphics.clear();
    // Convert percent of circle to rad & center sector in orientation
    const rad = sector.percent*2*Math.PI;
    // Set angles of sector
    const startAngle = sector.orientation - (rad/2);
    const endAngle = sector.orientation + (rad/2);
    graphics.fillStyle(0xff0000, 0.2);
    graphics.slice(sector.center.x, sector.center.y, sector.radius, startAngle, endAngle, false);
    graphics.fillPath();
    return graphics;
}

// Map of all possible orientations and corresponding unit circle radian values
export const orientationMap = new Map<string, number>([
    ["north", (3*Math.PI/2)],
    ["northeast", (7*Math.PI/4)],
    ["east", (0)],
    ["southeast", (Math.PI/4)],
    ["south", (Math.PI/2)],
    ["southwest", (3*Math.PI/4)],
    ["west", (Math.PI)],
    ["northwest", (5*Math.PI/4)],
])

export const oppositeOrientation = new Map<string, string>([
    ["north", "south"],
    ["northeast", "southwest"],
    ["east", "west"],
    ["southeast", "northwest"],
    ["south", "north"],
    ["southwest", "northeast"],
    ["west", "east"],
    ["northwest", "southeast"],
])

export function RandomOrientation(): string {
	let keys = Array.from(orientationMap.keys());
	return keys[Phaser.Math.Between(0, keys.length-1)];
}

export function Randomize(s: string[]): string {
	let seed = Phaser.Math.Between(0, s.length-1);
	return s[seed];
}

// "Object is ___ of organism" where ___ is the relative orientation.
export function GetRelativePosition(orgBound: Phaser.Geom.Rectangle, objBound: Phaser.Geom.Rectangle): string {
    let newOrientation = "";

    // Check relative vertical pos
    if (orgBound.centerY - objBound.centerY > 20) { // Object is above organism
        newOrientation += "north";
    } else if (orgBound.centerY - objBound.centerY < -20) { // Object is below organism
        newOrientation += "south";
    }    

    // Check relative horizontal pos
    if (orgBound.centerX - objBound.centerX > 20) { // Object is to the left of organism
        newOrientation += "west";
    } else if (orgBound.centerX - objBound.centerX < -20) { // Object is to the right of organism
        newOrientation += "east";
    }

    // Overlaps if string still empty
     
    return newOrientation; // If returns empty string, then objects are overlapping.
}
