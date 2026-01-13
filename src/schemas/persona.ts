/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
import { z } from "zod";

/**
 * Persona ID pattern: kebab-case (e.g., analyst-alex, developer-dave)
 */
const PersonaIdSchema = z
    .string()
    .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, "ID must match pattern kebab-case (e.g., analyst-alex)");

/**
 * Expertise levels
 */
const ExpertiseLevelSchema = z.enum(["novice", "intermediate", "expert"]);

/**
 * Persona characteristics
 */
const CharacteristicsSchema = z.object({
    expertise: ExpertiseLevelSchema,
    time_pressure: z.string().optional(),
    graph_literacy: z.string().optional(),
    domain_knowledge: z.string().optional(),
});

/**
 * Persona schema for design management
 */
export const PersonaSchema = z.object({
    id: PersonaIdSchema,
    name: z.string().min(1),
    role: z.string().min(1),
    characteristics: CharacteristicsSchema,
    goals: z.array(z.string()).min(1),
    frustrations: z.array(z.string()).optional().default([]),
    workflows: z.array(z.string()).optional().default([]),
});

/**
 * Persona type derived from schema
 */
export type Persona = z.infer<typeof PersonaSchema>;

/**
 * Persona summary for list operations
 */
export interface PersonaSummary {
    id: string;
    name: string;
    role: string;
    expertise: string;
}

/**
 * Resolved references for a persona
 */
export interface PersonaResolved {
    workflows: Array<{ id: string; name: string }>;
}

/**
 * Persona with resolved references
 */
export type PersonaWithResolved = Persona & { _resolved: PersonaResolved };
