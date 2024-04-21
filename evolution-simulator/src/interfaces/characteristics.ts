export interface Characteristics {
    diet: number,
    metabolism: number, // If hunger exceeds metabolism, then organism starves
    mobility: number,
    visibility: number, // Difference between color of organism and color of background, minus patterns, plus size // Less visible = more likely for others to miss
    detection: number,
    speed: number, // Highest for medium sized organisms, lower on either extreme - mouse slower than elephant, but better probability of being missed
    strength: number, // Plus size, claws, teeth, etc..

    //sociability: number,
}