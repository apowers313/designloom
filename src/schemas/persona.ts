/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
import { z } from "zod";

import { SourceSchema, VersionMetadataSchema } from "./source.js";

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
 * Usage frequency options
 */
const FrequencySchema = z.enum(["daily", "weekly", "monthly", "as-needed"]);

/**
 * Device types
 */
const DeviceSchema = z.enum(["desktop", "laptop", "tablet", "mobile"]);

/**
 * Usage context - how the persona interacts with the product
 */
const ContextSchema = z.object({
    frequency: FrequencySchema.optional(),
    devices: z.array(DeviceSchema).optional(),
    voluntary: z.boolean().optional(),
});

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
    quote: z.string().optional(),
    bio: z.string().optional(),
    characteristics: CharacteristicsSchema,
    motivations: z.array(z.string()).optional().default([]),
    behaviors: z.array(z.string()).optional().default([]),
    goals: z.array(z.string()).min(1),
    frustrations: z.array(z.string()).optional().default([]),
    context: ContextSchema.optional(),
    workflows: z.array(z.string()).optional().default([]),
    sources: z.array(SourceSchema).optional().default([]),
}).merge(VersionMetadataSchema);

/**
 * Persona type derived from schema
 */
export type Persona = z.infer<typeof PersonaSchema>;

/**
 * Context type derived from schema
 */
export type PersonaContext = z.infer<typeof ContextSchema>;

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
