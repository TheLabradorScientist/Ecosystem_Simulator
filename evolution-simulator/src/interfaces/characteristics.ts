export interface Characteristics {
    diet: number,
    metabolism: number, // Fixed. If hunger exceeds metabolism, then organism starves
    mobility: number,
    visibility: number, // Difference between color of organism and color of background, minus patterns, plus size // Less visible = more likely for others to miss
    detection: number,
    speed: number, // Highest for medium sized organisms, lower on either extreme - mouse slower than elephant, but better probability of being missed
    strength: number, // Plus size, claws, teeth, etc..

    //sociability: number,
}

// To clarify, metabolism is a fixed value. If energy is below metabolism,
// Then the organism's hunger will go up and energy will be recovered until
// either it reaches metabolism or hunger = 3/4 metabolism, whichever comes
// first. Hunger and energy can never go below 0.