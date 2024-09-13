import { Organism, Phenotype } from "../objects/organism";

export interface Population {

    // Unique ID
    id: number,

    // Map containing all unique individuals in population 
    // Each key = organism with unique set of traits.
    // Each value = # of organisms with the phenotype.
    phenotypeMap: Map<Phenotype, number>,
    // or maybe a Set<Organism> ?? May need to use a 
    // Set containing unique arrays of traits.

    // Set of all living organisms in the population.
    livingIndividuals: Set<Organism>,

    updateNeeded: boolean
}