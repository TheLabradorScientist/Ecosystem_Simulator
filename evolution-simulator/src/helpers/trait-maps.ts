// TRAITS INTERFACE USED IN ARRAYS FOR ALL POSSIBLE TRAITS FOR EACH GROUPING (HEAD, BODY, FORELIMBS, HINDLIMBS, + TAIL)

// FOCUS ON TETRAPODS
// HEAD - Grouping of traits: teeth, eyes, ears, face/nose (teeth impact diet, others impact detection ability)
// BODY - Grouping of traits: build, size, patterns, digestion (digestion impacts diet, others impact visibility/camouflage, speed, strength/defense/offense)
//   Scales->increase water mobility, feathers->increase air mobility, decrease strength,
//   fur->increase strength, skin->decrease strength, increase energy/speed

// FORELIMBS - Grouping of traits: shape(flipper, wing, or arm/leg), extremity(claws, paws, hands, hooves) (impact speed, mobility(air, water, or land), and diet (claws-> carnivore, hooves->herbivore))
// HINDLIMBS - Grouping of traits: shape, mostly correlates with forelimbs
// TAIL - ON/OFF Trait- Present or absent. If present, varies between shapes (mobility= tail feathers-> air, finned->water/prehensile->increase ability to climb)
// POSSIBLE PATHS- maybe alternative where bright colors=advantageous, such as poisonous animals or mating, perhaps horns/antlers for defense

// Sharp teeth increase strength, but decrease herbivory
// Claws increase strength and carnivory, but decrease herbivory
// Hooves increase speed and herbivory but decrease carnivory
// Larger size increase strength but decrease energy

// All values add up to 0, with either extreme being -10 or 10.
//	Ex) short gut = +4 carn, + claws = +2 carn, + sharp teeth = +3 carn, + slit pupils = +1 carn
// +6+ = obligate carnivore, -6- = obligate herbivore, 3:5 / -3:-5 = facultative, -2:+2 = omnivore
// aka, closer to -10 = more herbivorous, closer to +10 = more carnivorous, -2:+2 = omnivorous

// Diet starts at 0, is determined by variety of factors -
//
//	Teeth, Extremity, Gut, Pupil.
export const dietTraits = new Map<string, number>([
	["sharp canines", +3],
	["flat molars",   -3],
	["mixed teeth",   0],

	["claws",  +2],
	["hooves", -2],
	["paws",   0],
	["hands",  0],

	["short, simple",   +4],
	["long, chambered", -4],

	["front, slit pupils",       +1],
	["sides, horizontal pupils", -1],
	["small, round pupils",      0],
	["large, round pupils",      0],
])

// Mobility is determined using different scale. Aquatic only = -10, Terrestrial only = 10.
// More extreme means the organism is better at moving in the respective environment, and will
// get a speed boost and reduced energy cost while moving in the environment. -5 to 5 are
// semiaquatic and can enter both land and water, but will not be as efficient at moving.
// Meanwhile, having all required traits for flight unlocks special number (50).
export const mobilityTraits = new Map<string, number>([
	["scales", -2],
	["fur",    2],

	["fins",    -2], // *3 max (forelimb, hindlimb, tail)
	["hindfins", -2], // *3 max (forelimb, hindlimb, tail)
	["tailfin",  -2], // *3 max (forelimb, hindlimb, tail)

	["arms/legs", +2], // *2 max (forelimb, hindlimb)
	["legs",      +2], // *2 max (forelimb, hindlimb)

	["prehensile", +2],

	["no external ears",    -2],
	["large, movable ears", +2],
])

// Detection is a bit different. -10 means great panoramic detection, poor binocular
// aka can detect threats at sides (2 tiles) and behind (1 tiles) more quickly, but cannot see far ahead (2 tiles).
// +10 means great binocular detection, can see far ahead (5 tiles). but not sides/behind (1 tile, 0 tile)
// Closer to 0 -> less specialized, more general. 0 can see 3 tiles head, 1 tile sides, 0 tiles behind

// Calculate probabilty of fight vs flight based on speed, strength, and distance at detection

export const detectionTraits = new Map<string, number>([
	["front, slit pupils",       +4],
	["sides, horizontal pupils", -4],
	["small, round pupils",      0],
	["large, round pupils",      0],

	["nostrils",     0],
	["short muzzle", +2],
	["long snout",   -2],
	["beak",         0],

	["large, movable ears",      -4],
	["small, streamlined ears",  0],
	["forward, triangular ears", +4],
	["no external ears",         0],
])


// Absent body parts decrease visibility- ideal for ambuush carnivores (ie snakes).

export const visibilityTraits = new Map<string, number>([ // Ehh
	["lithe",       -2],
	["bulky", 		+2],

	["small",      -2],
	["large",      +2],

	["stripes",     -2],
	["spots", 		-2],
	// Option for colorful markings ?

	["no forelimbs",      -2],
	["no hindlimbs",  		-2],
	
])

export const speedTraits = new Map<string, number>([ // Work in Progress
	["lithe",       +2],
	["bulky", 		-2],

	["small",      +1],
	["medium",		+2],
	["large",      -1],

	["small, streamlined ears", +2],

	["scales",     			-2],

	["no forelimbs", 		-1],
	["no hindlimbs", 		-2],
	["arms/legs", 			+1],
	["legs", 				+1],
	["wings", 				+2],
	
	["hooves", 				+2],
	["paws", 				+2],
	["hands", 				-2],
		
])