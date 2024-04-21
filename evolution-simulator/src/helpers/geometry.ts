// Position type
export type position = { x: number; y: number}
// Sector type
export interface Sector {
    center: position;
    radius: number;
    percent: number;
    orientation: number;
}
// Draw Sector https://newdocs.phaser.io/docs/3.55.2/Phaser.GameObjects.Arc (object collision method)
export function DrawSector(scene: Phaser.Scene, sector: Sector): Phaser.GameObjects.Graphics {
    // Convert percent of circle to rad & center sector in orientation
    const rad = sector.percent*2*Math.PI;
    // Set angles of sector
    const startAngle = sector.orientation - (rad/2);
    const endAngle = sector.orientation + (rad/2);
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xff0000, 0.2);
    graphics.slice(sector.center.x, sector.center.y, sector.radius, startAngle, endAngle, false);
    graphics.fillPath();
    return graphics;
}

// Rectangle type
export interface Rectangle {
    center: position,
    width: number,
    height: number,
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

export function RandomOrientation(): string {
	let keys = Array.from(orientationMap.keys());
	return keys[Phaser.Math.Between(0, keys.length-1)];
}

export function Randomize(s: string[]): string {
	let seed = Phaser.Math.Between(0, s.length-1);
	return s[seed];
}