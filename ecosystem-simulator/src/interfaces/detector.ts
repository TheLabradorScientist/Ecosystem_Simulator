import { DrawSector, Line, Sector } from "../helpers/geometry";
import { Organism } from "../objects/organism";
import { Plant } from "./food";

export class Detector {
    sector: Sector;
    sectorGraphic: Phaser.GameObjects.Graphics;
    scene: Phaser.Scene;
    detectedObjects: Phaser.GameObjects.GameObject[];

    constructor(rect: Phaser.GameObjects.Rectangle, det: number) {
        this.scene = rect.scene;
        this.sector = {center: {x: rect.x, y: rect.y}, radius: 160 + (8*det), percent: (0.5 - (det/25)), orientation: rect.rotation};
        this.sectorGraphic = this.scene.add.graphics();
        this.detectedObjects = [];
        DrawSector(this.sectorGraphic, this.sector);
    }

    // Call this in update function so it constantly checks if any external
    // object overlaps and returns the object(s) if so, else returns null.
    // Also change orientation of the organism based on the feedback
    // of the detected object: neutral / move toward / move away
    CollisionDetected(otherObject: Phaser.GameObjects.Image | Plant | Organism, otherBounds: Phaser.Geom.Rectangle): Phaser.GameObjects.Image | Plant | Organism | null {
        // Get bounding circle of sector (arc).
        const arcBounds = new Phaser.Geom.Circle(this.sector.center.x, this.sector.center.y, this.sector.radius)
        // Check if bounding shapes intersect. If not, no need to check further.
        if (Phaser.Geom.Intersects.CircleToRectangle(arcBounds, otherBounds)) {
            // Get array of points over which bounding shapes intersect.
            let intersect_points: Phaser.Geom.Point[] = Phaser.Geom.Intersects.GetCircleToRectangle(arcBounds, otherBounds);
            
            // NOTE: OUTPUT ARRAY HAS THE POINTS OF INTERSECTION WHERE EACH LINE THAT FORMS THE
                // RECTANGLE INTERSECTS THE CIRCLE- SO, UP TO 2 (IF LINE ENTERS & EXITS), 8 TOTAL
            
            //console.log(intersect_points);
            // Create new array for arc points
            let arc_points: Phaser.Geom.Point[] = [];
            // Get start angle (arc_sa) & end angle (arc_ea).
            let arc_sa = this.sector.orientation - (this.sector.percent*Math.PI);
            let arc_ea = this.sector.orientation + (this.sector.percent*Math.PI);
            // Loop over angles between the start and end angle, incrementing by pi/16.
            for (let n = arc_sa; n < arc_ea; (n+=(Math.PI/6))) {
                // Add the circumference point at the given angle to the array of arc points.
                    //console.log(Phaser.Geom.Circle.CircumferencePoint(arcBounds, n).x, ', ', Phaser.Geom.Circle.CircumferencePoint(arcBounds, n).y)
                arc_points.push(Phaser.Geom.Circle.CircumferencePoint(arcBounds, n));
            }

            // console.log(arc_points.length);

            const tolerance = 1
            // Check if any arc points match any intersection points, with tolerance 1.
            if (intersect_points.some(point => arc_points.some(
                arcPoint => Math.abs(arcPoint.x - point.x) <= tolerance 
                && Math.abs(arcPoint.y - point.y) <= tolerance))) {
                    // If true, the object is 'detected' and returned.
                    this.detectedObjects.push(otherObject);
                    return otherObject;
            }
        }
        return null;
        
        /* var overlappingList: Phaser.GameObjects.GameObject[] = [];

        //console.log("2");
        const overlaps = this.scene.physics.overlap(this.sectorGraphic, otherObjects, (sectorGraphic, otherObject) => {
            //overlappingList.push(otherObject);
        });
        
        //console.log(overlaps);
        if (overlaps) {
            console.log("3")
            return overlappingList[0]; // First object that it overlaps with
        } else { return null; }
        } */
    }

}

// Returns true iff an arc and a line intersect at any point
export function ArcLineCollision(circle: Phaser.Geom.Circle, arc: Sector, line: Line): boolean {
    return false;
/*     // Factor of 2 cancels out when converting to rad (*2) and calculating portion (/2)
    let a1 = arc.orientation - (arc.percent*Math.PI);
    let a2 = arc.orientation + (arc.percent*Math.PI);

    let min_a = Math.min(a1, a2);
    let max_a = Math.max(a1, a2);

    let x1 = line.pos1.x;
    let y1 = line.pos1.y;
    let x2 = line.pos2.x;
    let y2 = line.pos2.y;

    let dx = x2 - x1;
    let dy = y2 - y1;

    let a_line = Math.atan2(dy, dx) + Math.PI;

    return (a_line>min_a) && (a_line<max_a); */
}

// Returns true iff a line and a line intersect at any point
export function LineLineCollision(): boolean {
    return false;
}


// Detect function returns the orientation object was detected at
// Calculate whether organism is neutral, moves towards, or moves away from detected object
