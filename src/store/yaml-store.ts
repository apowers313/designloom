/* eslint-disable camelcase -- snake_case matches YAML field names for serialization */
import * as fs from "node:fs";
import * as path from "node:path";

import { parse as parseYaml } from "yaml";
import type { ZodError } from "zod";

import {
    type Capability,
    type CapabilityFilters,
    CapabilitySchema,
    type CapabilitySummary,
    type CapabilityWithResolved,
    type Component,
    type ComponentFilters,
    ComponentSchema,
    type ComponentSummary,
    type ComponentWithResolved,
    type Persona,
    PersonaSchema,
    type PersonaSummary,
    type PersonaWithResolved,
    type Workflow,
    type WorkflowFilters,
    WorkflowSchema,
    type WorkflowSummary,
    type WorkflowWithResolved,
} from "../schemas/index.js";
import { updateYamlFile,writeYamlFile } from "./yaml-writer.js";

/**
 * Entity types for generic operations
 */
export type EntityType = "workflow" | "capability" | "persona" | "component";

/**
 * Dependency information returned by getDependencies
 */
export interface DependencyInfo {
    capabilities?: Array<{ id: string; name: string }>;
    personas?: Array<{ id: string; name: string }>;
    components?: Array<{ id: string; name: string }>;
}

/**
 * Dependent information returned by getDependents
 */
export interface DependentInfo {
    workflows?: Array<{ id: string; name: string }>;
    capabilities?: Array<{ id: string; name: string }>;
    components?: Array<{ id: string; name: string }>;
}

/**
 * Result of a create operation
 */
export interface CreateResult {
    success: boolean;
    error?: string;
}

/**
 * Result of an update operation
 */
export interface UpdateResult {
    success: boolean;
    error?: string;
}

/**
 * Options for delete operations
 */
export interface DeleteOptions {
    force?: boolean;
}

/**
 * Result of a delete operation
 */
export interface DeleteResult {
    success: boolean;
    error?: string;
    warnings?: string[];
}

/**
 * Relationship types for link/unlink operations
 */
export type RelationshipType = "requires" | "uses" | "suggests" | "implements" | "depends";

/**
 * Result of a link/unlink operation
 */
export interface LinkResult {
    success: boolean;
    error?: string;
}

/**
 * Input for creating a capability (subset of Capability without auto-managed fields)
 */
export interface CreateCapabilityInput {
    id: string;
    name: string;
    category: "data" | "visualization" | "analysis" | "interaction" | "export" | "collaboration" | "performance";
    description: string;
    status?: "planned" | "in-progress" | "implemented" | "deprecated";
    algorithms?: string[];
    used_by_workflows?: string[];
    implemented_by_components?: string[];
    requirements?: string[];
}

/**
 * Input for creating a persona
 */
export interface CreatePersonaInput {
    id: string;
    name: string;
    role: string;
    characteristics: {
        expertise: "novice" | "intermediate" | "expert";
        time_pressure?: string;
        graph_literacy?: string;
        domain_knowledge?: string;
    };
    goals: string[];
    frustrations?: string[];
    workflows?: string[];
}

/**
 * Input for creating a component
 */
export interface CreateComponentInput {
    id: string;
    name: string;
    category: "dialog" | "control" | "display" | "layout" | "utility" | "navigation";
    description: string;
    status?: "planned" | "in-progress" | "implemented" | "deprecated";
    implements_capabilities?: string[];
    used_in_workflows?: string[];
    dependencies?: string[];
    props?: Record<string, string>;
}

/**
 * Input for creating a workflow
 */
export interface CreateWorkflowInput {
    id: string;
    name: string;
    category: "onboarding" | "analysis" | "exploration" | "reporting" | "collaboration" | "administration";
    goal: string;
    validated?: boolean;
    personas?: string[];
    requires_capabilities?: string[];
    suggested_components?: string[];
    starting_state?: {
        data_type?: string;
        node_count?: string;
        edge_density?: string;
        user_expertise?: string;
    };
    success_criteria?: Array<{ metric: string; target: string }>;
}

/**
 * Input for updating a workflow (all fields optional)
 */
export interface UpdateWorkflowInput {
    name?: string;
    category?: "onboarding" | "analysis" | "exploration" | "reporting" | "collaboration" | "administration";
    goal?: string;
    validated?: boolean;
    personas?: string[];
    requires_capabilities?: string[];
    suggested_components?: string[];
    starting_state?: {
        data_type?: string;
        node_count?: string;
        edge_density?: string;
        user_expertise?: string;
    };
    success_criteria?: Array<{ metric: string; target: string }>;
}

/**
 * Input for updating a capability (all fields optional)
 */
export interface UpdateCapabilityInput {
    name?: string;
    category?: "data" | "visualization" | "analysis" | "interaction" | "export" | "collaboration" | "performance";
    description?: string;
    status?: "planned" | "in-progress" | "implemented" | "deprecated";
    algorithms?: string[];
    requirements?: string[];
}

/**
 * Input for updating a persona (all fields optional)
 */
export interface UpdatePersonaInput {
    name?: string;
    role?: string;
    characteristics?: {
        expertise: "novice" | "intermediate" | "expert";
        time_pressure?: string;
        graph_literacy?: string;
        domain_knowledge?: string;
    };
    goals?: string[];
    frustrations?: string[];
}

/**
 * Input for updating a component (all fields optional)
 */
export interface UpdateComponentInput {
    name?: string;
    category?: "dialog" | "control" | "display" | "layout" | "utility" | "navigation";
    description?: string;
    status?: "planned" | "in-progress" | "implemented" | "deprecated";
    implements_capabilities?: string[];
    used_in_workflows?: string[];
    dependencies?: string[];
    props?: Record<string, string>;
}

// ============= ANALYSIS TYPES =============

/**
 * Result of validation
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Capability coverage entry in coverage report
 */
export interface CapabilityCoverageEntry {
    id: string;
    name: string;
    status: string;
    workflow_count: number;
    component_count: number;
}

/**
 * Persona coverage entry in coverage report
 */
export interface PersonaCoverageEntry {
    id: string;
    name: string;
    workflow_count: number;
}

/**
 * Component coverage entry in coverage report
 */
export interface ComponentCoverageEntry {
    id: string;
    name: string;
    status: string;
    capability_count: number;
    workflow_count: number;
}

/**
 * Workflow coverage entry in coverage report
 */
export interface WorkflowCoverageEntry {
    id: string;
    name: string;
    category: string;
    capabilities_ready: boolean;
    missing_capabilities: string[];
}

/**
 * Implementation status breakdown
 */
export interface ImplementationStatus {
    planned: number;
    "in-progress": number;
    implemented: number;
    deprecated: number;
}

/**
 * Coverage report summary
 */
export interface CoverageReportSummary {
    total_workflows: number;
    total_capabilities: number;
    total_personas: number;
    total_components: number;
    implementation_status: ImplementationStatus;
}

/**
 * Full coverage report
 */
export interface CoverageReport {
    summary: CoverageReportSummary;
    capability_coverage: CapabilityCoverageEntry[];
    persona_coverage: PersonaCoverageEntry[];
    component_coverage: ComponentCoverageEntry[];
    workflow_coverage: WorkflowCoverageEntry[];
}

/**
 * Orphan result structure
 */
export interface OrphanResult {
    capabilities: Array<{ id: string; name: string }>;
    personas: Array<{ id: string; name: string }>;
    components: Array<{ id: string; name: string }>;
}

/**
 * Category coverage info
 */
export interface CategoryCoverage {
    category: string;
    workflow_count: number;
}

/**
 * Gap analysis result
 */
export interface GapAnalysis {
    workflows_without_capabilities: Array<{ id: string; name: string }>;
    workflows_without_personas: Array<{ id: string; name: string }>;
    capabilities_without_components: Array<{ id: string; name: string }>;
    categories_with_few_workflows: CategoryCoverage[];
}

/**
 * Priority suggestion options
 */
export interface PriorityOptions {
    focus: "capability" | "workflow";
    limit?: number;
}

/**
 * Single priority recommendation
 */
export interface PriorityRecommendation {
    id: string;
    name: string;
    reasoning: string;
    workflows_unblocked: string[];
    score: number;
}

/**
 * Priority suggestions summary
 */
export interface PrioritySuggestionsSummary {
    total_unimplemented: number;
    total_blocked_workflows: number;
}

/**
 * Full priority suggestions result
 */
export interface PrioritySuggestions {
    recommendations: PriorityRecommendation[];
    summary: PrioritySuggestionsSummary;
}

// ============= TEST GENERATION TYPES =============

/**
 * Options for test generation
 */
export interface TestGenOptions {
    format?: "vitest" | "playwright";
}

// ============= DIAGRAM EXPORT TYPES =============

/**
 * Options for diagram export
 */
export interface DiagramOptions {
    focus: string;
    depth?: number;
}

/**
 * Store for reading and querying design documents from YAML files.
 * Provides caching and relationship resolution for all entity types.
 */
export class DesignDocsStore {
    private basePath: string;
    private workflowsPath: string;
    private capabilitiesPath: string;
    private personasPath: string;
    private componentsPath: string;

    // Caches for loaded entities
    private workflowCache: Map<string, Workflow> = new Map();
    private capabilityCache: Map<string, Capability> = new Map();
    private personaCache: Map<string, Persona> = new Map();
    private componentCache: Map<string, Component> = new Map();
    private cacheLoaded = false;

    /**
     * Creates a new DesignDocsStore instance.
     * @param basePath - Base path to the design documents directory
     */
    constructor(basePath: string) {
        this.basePath = basePath;
        this.workflowsPath = path.join(basePath, "workflows");
        this.capabilitiesPath = path.join(basePath, "capabilities");
        this.personasPath = path.join(basePath, "personas");
        this.componentsPath = path.join(basePath, "components");
    }

    /**
     * Ensure all entities are loaded into cache
     */
    private ensureCacheLoaded(): void {
        if (this.cacheLoaded) {
            return;
        }

        this.loadEntitiesIntoCache(this.workflowsPath, WorkflowSchema, this.workflowCache);
        this.loadEntitiesIntoCache(this.capabilitiesPath, CapabilitySchema, this.capabilityCache);
        this.loadEntitiesIntoCache(this.personasPath, PersonaSchema, this.personaCache);
        this.loadEntitiesIntoCache(this.componentsPath, ComponentSchema, this.componentCache);

        this.cacheLoaded = true;
    }

    /**
     * Load all YAML files from a directory into a cache.
     * @param dirPath - Directory path to load from
     * @param schema - Zod schema with parse function for validation
     * @param schema.parse - Parse function that validates and returns entity
     * @param cache - Map to store parsed entities
     */
    private loadEntitiesIntoCache<T extends { id: string }>(
        dirPath: string,
        schema: { parse: (data: unknown) => T },
        cache: Map<string, T>
    ): void {
        if (!fs.existsSync(dirPath)) {
            return;
        }

        const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".yaml") || f.endsWith(".yml"));
        for (const file of files) {
            try {
                const filePath = path.join(dirPath, file);
                const content = fs.readFileSync(filePath, "utf-8");
                const data = parseYaml(content);
                const entity = schema.parse(data);
                cache.set(entity.id, entity);
            } catch {
                // Skip invalid files
            }
        }
    }

    /**
     * List all workflows with optional filters.
     * @param filters - Optional filters for category, validated status, persona, or capability
     * @returns Array of workflow summaries
     */
    listWorkflows(filters?: WorkflowFilters): WorkflowSummary[] {
        this.ensureCacheLoaded();

        let workflows = Array.from(this.workflowCache.values());

        if (filters?.category) {
            workflows = workflows.filter(w => w.category === filters.category);
        }
        if (filters?.validated !== undefined) {
            workflows = workflows.filter(w => w.validated === filters.validated);
        }
        if (filters?.persona) {
            workflows = workflows.filter(w => w.personas.includes(filters.persona ?? ""));
        }
        if (filters?.capability) {
            workflows = workflows.filter(w => w.requires_capabilities.includes(filters.capability ?? ""));
        }

        return workflows.map(w => ({
            id: w.id,
            name: w.name,
            category: w.category,
            validated: w.validated ?? false,
        }));
    }

    /**
     * List all capabilities with optional filters.
     * @param filters - Optional filters for category, status, or workflow
     * @returns Array of capability summaries
     */
    listCapabilities(filters?: CapabilityFilters): CapabilitySummary[] {
        this.ensureCacheLoaded();

        let capabilities = Array.from(this.capabilityCache.values());

        if (filters?.category) {
            capabilities = capabilities.filter(c => c.category === filters.category);
        }
        if (filters?.status) {
            capabilities = capabilities.filter(c => c.status === filters.status);
        }
        if (filters?.workflow) {
            capabilities = capabilities.filter(c => c.used_by_workflows.includes(filters.workflow ?? ""));
        }

        return capabilities.map(c => ({
            id: c.id,
            name: c.name,
            category: c.category,
            status: c.status ?? "planned",
        }));
    }

    /**
     * List all personas.
     * @returns Array of persona summaries
     */
    listPersonas(): PersonaSummary[] {
        this.ensureCacheLoaded();

        return Array.from(this.personaCache.values()).map(p => ({
            id: p.id,
            name: p.name,
            role: p.role,
            expertise: p.characteristics.expertise,
        }));
    }

    /**
     * List all components with optional filters.
     * @param filters - Optional filters for category, status, or capability
     * @returns Array of component summaries
     */
    listComponents(filters?: ComponentFilters): ComponentSummary[] {
        this.ensureCacheLoaded();

        let components = Array.from(this.componentCache.values());

        if (filters?.category) {
            components = components.filter(c => c.category === filters.category);
        }
        if (filters?.status) {
            components = components.filter(c => c.status === filters.status);
        }
        if (filters?.capability) {
            components = components.filter(c => c.implements_capabilities.includes(filters.capability ?? ""));
        }

        return components.map(c => ({
            id: c.id,
            name: c.name,
            category: c.category,
            status: c.status ?? "planned",
        }));
    }

    /**
     * Get a workflow by ID with resolved relationships.
     * @param id - Workflow ID
     * @returns Workflow with resolved references or null if not found
     */
    getWorkflow(id: string): WorkflowWithResolved | null {
        this.ensureCacheLoaded();

        const workflow = this.workflowCache.get(id);
        if (!workflow) {
            return null;
        }

        return {
            ...workflow,
            _resolved: {
                capabilities: workflow.requires_capabilities
                    .map(capId => {
                        const cap = this.capabilityCache.get(capId);
                        return cap ? { id: cap.id, name: cap.name, status: cap.status } : null;
                    })
                    .filter((c): c is NonNullable<typeof c> => c !== null),
                personas: workflow.personas
                    .map(personaId => {
                        const persona = this.personaCache.get(personaId);
                        return persona ? { id: persona.id, name: persona.name } : null;
                    })
                    .filter((p): p is NonNullable<typeof p> => p !== null),
                components: workflow.suggested_components
                    .map(compId => {
                        const comp = this.componentCache.get(compId);
                        return comp ? { id: comp.id, name: comp.name } : null;
                    })
                    .filter((c): c is NonNullable<typeof c> => c !== null),
            },
        };
    }

    /**
     * Get a capability by ID with resolved relationships.
     * @param id - Capability ID
     * @returns Capability with resolved references or null if not found
     */
    getCapability(id: string): CapabilityWithResolved | null {
        this.ensureCacheLoaded();

        const capability = this.capabilityCache.get(id);
        if (!capability) {
            return null;
        }

        return {
            ...capability,
            _resolved: {
                workflows: capability.used_by_workflows
                    .map(wfId => {
                        const wf = this.workflowCache.get(wfId);
                        return wf ? { id: wf.id, name: wf.name } : null;
                    })
                    .filter((w): w is NonNullable<typeof w> => w !== null),
                components: capability.implemented_by_components
                    .map(compId => {
                        const comp = this.componentCache.get(compId);
                        return comp ? { id: comp.id, name: comp.name } : null;
                    })
                    .filter((c): c is NonNullable<typeof c> => c !== null),
            },
        };
    }

    /**
     * Get a persona by ID with resolved relationships.
     * @param id - Persona ID
     * @returns Persona with resolved references or null if not found
     */
    getPersona(id: string): PersonaWithResolved | null {
        this.ensureCacheLoaded();

        const persona = this.personaCache.get(id);
        if (!persona) {
            return null;
        }

        return {
            ...persona,
            _resolved: {
                workflows: persona.workflows
                    .map(wfId => {
                        const wf = this.workflowCache.get(wfId);
                        return wf ? { id: wf.id, name: wf.name } : null;
                    })
                    .filter((w): w is NonNullable<typeof w> => w !== null),
            },
        };
    }

    /**
     * Get a component by ID with resolved relationships.
     * @param id - Component ID
     * @returns Component with resolved references or null if not found
     */
    getComponent(id: string): ComponentWithResolved | null {
        this.ensureCacheLoaded();

        const component = this.componentCache.get(id);
        if (!component) {
            return null;
        }

        // Find dependents (components that depend on this one)
        const dependents = Array.from(this.componentCache.values())
            .filter(c => c.dependencies.includes(id))
            .map(c => ({ id: c.id, name: c.name }));

        return {
            ...component,
            _resolved: {
                capabilities: component.implements_capabilities
                    .map(capId => {
                        const cap = this.capabilityCache.get(capId);
                        return cap ? { id: cap.id, name: cap.name } : null;
                    })
                    .filter((c): c is NonNullable<typeof c> => c !== null),
                workflows: component.used_in_workflows
                    .map(wfId => {
                        const wf = this.workflowCache.get(wfId);
                        return wf ? { id: wf.id, name: wf.name } : null;
                    })
                    .filter((w): w is NonNullable<typeof w> => w !== null),
                dependents,
            },
        };
    }

    /**
     * Check if a workflow exists.
     * @param id - Workflow ID to check
     * @returns True if workflow exists
     */
    workflowExists(id: string): boolean {
        this.ensureCacheLoaded();
        return this.workflowCache.has(id);
    }

    /**
     * Check if a capability exists.
     * @param id - Capability ID to check
     * @returns True if capability exists
     */
    capabilityExists(id: string): boolean {
        this.ensureCacheLoaded();
        return this.capabilityCache.has(id);
    }

    /**
     * Check if a persona exists.
     * @param id - Persona ID to check
     * @returns True if persona exists
     */
    personaExists(id: string): boolean {
        this.ensureCacheLoaded();
        return this.personaCache.has(id);
    }

    /**
     * Check if a component exists.
     * @param id - Component ID to check
     * @returns True if component exists
     */
    componentExists(id: string): boolean {
        this.ensureCacheLoaded();
        return this.componentCache.has(id);
    }

    /**
     * Get dependencies for an entity (what it depends on).
     * @param entityType - Type of entity
     * @param id - Entity ID
     * @returns Dependencies or null if entity not found
     */
    getDependencies(entityType: EntityType, id: string): DependencyInfo | null {
        this.ensureCacheLoaded();

        switch (entityType) {
            case "workflow": {
                const workflow = this.workflowCache.get(id);
                if (!workflow) {
                    return null;
                }
                return {
                    capabilities: workflow.requires_capabilities
                        .map(capId => {
                            const cap = this.capabilityCache.get(capId);
                            return cap ? { id: cap.id, name: cap.name } : null;
                        })
                        .filter((c): c is NonNullable<typeof c> => c !== null),
                    personas: workflow.personas
                        .map(personaId => {
                            const persona = this.personaCache.get(personaId);
                            return persona ? { id: persona.id, name: persona.name } : null;
                        })
                        .filter((p): p is NonNullable<typeof p> => p !== null),
                    components: workflow.suggested_components
                        .map(compId => {
                            const comp = this.componentCache.get(compId);
                            return comp ? { id: comp.id, name: comp.name } : null;
                        })
                        .filter((c): c is NonNullable<typeof c> => c !== null),
                };
            }
            case "capability": {
                const capability = this.capabilityCache.get(id);
                if (!capability) {
                    return null;
                }
                return {
                    components: capability.implemented_by_components
                        .map(compId => {
                            const comp = this.componentCache.get(compId);
                            return comp ? { id: comp.id, name: comp.name } : null;
                        })
                        .filter((c): c is NonNullable<typeof c> => c !== null),
                };
            }
            case "persona": {
                const persona = this.personaCache.get(id);
                if (!persona) {
                    return null;
                }
                return {};
            }
            case "component": {
                const component = this.componentCache.get(id);
                if (!component) {
                    return null;
                }
                return {
                    components: component.dependencies
                        .map(compId => {
                            const comp = this.componentCache.get(compId);
                            return comp ? { id: comp.id, name: comp.name } : null;
                        })
                        .filter((c): c is NonNullable<typeof c> => c !== null),
                };
            }
            default:
                return null;
        }
    }

    /**
     * Get dependents for an entity (what depends on it).
     * @param entityType - Type of entity
     * @param id - Entity ID
     * @returns Dependents or null if entity not found
     */
    getDependents(entityType: EntityType, id: string): DependentInfo | null {
        this.ensureCacheLoaded();

        switch (entityType) {
            case "workflow": {
                if (!this.workflowCache.has(id)) {
                    return null;
                }
                return {};
            }
            case "capability": {
                if (!this.capabilityCache.has(id)) {
                    return null;
                }
                const workflows = Array.from(this.workflowCache.values())
                    .filter(w => w.requires_capabilities.includes(id))
                    .map(w => ({ id: w.id, name: w.name }));
                return { workflows };
            }
            case "persona": {
                if (!this.personaCache.has(id)) {
                    return null;
                }
                const workflows = Array.from(this.workflowCache.values())
                    .filter(w => w.personas.includes(id))
                    .map(w => ({ id: w.id, name: w.name }));
                return { workflows };
            }
            case "component": {
                if (!this.componentCache.has(id)) {
                    return null;
                }
                const workflows = Array.from(this.workflowCache.values())
                    .filter(w => w.suggested_components.includes(id))
                    .map(w => ({ id: w.id, name: w.name }));
                const capabilities = Array.from(this.capabilityCache.values())
                    .filter(c => c.implemented_by_components.includes(id))
                    .map(c => ({ id: c.id, name: c.name }));
                return { workflows, capabilities };
            }
            default:
                return null;
        }
    }

    /**
     * Refresh the cache by reloading all files.
     */
    refresh(): void {
        this.workflowCache.clear();
        this.capabilityCache.clear();
        this.personaCache.clear();
        this.componentCache.clear();
        this.cacheLoaded = false;
        this.ensureCacheLoaded();
    }

    // ============= CREATE OPERATIONS =============

    /**
     * Create a new capability.
     * @param data - Capability data to create
     * @returns Result with success status and optional error message
     */
    createCapability(data: CreateCapabilityInput): CreateResult {
        this.ensureCacheLoaded();

        // Check for duplicate ID
        if (this.capabilityCache.has(data.id)) {
            return { success: false, error: `Capability '${data.id}' already exists` };
        }

        // Validate against schema
        try {
            const capability = CapabilitySchema.parse(data);

            // Write to file
            writeYamlFile(this.capabilitiesPath, capability.id, capability);

            // Update cache
            this.capabilityCache.set(capability.id, capability);

            return { success: true };
        } catch (err) {
            return { success: false, error: this.formatZodError(err as ZodError) };
        }
    }

    /**
     * Create a new persona.
     * @param data - Persona data to create
     * @returns Result with success status and optional error message
     */
    createPersona(data: CreatePersonaInput): CreateResult {
        this.ensureCacheLoaded();

        // Check for duplicate ID
        if (this.personaCache.has(data.id)) {
            return { success: false, error: `Persona '${data.id}' already exists` };
        }

        // Validate against schema
        try {
            const persona = PersonaSchema.parse(data);

            // Write to file
            writeYamlFile(this.personasPath, persona.id, persona);

            // Update cache
            this.personaCache.set(persona.id, persona);

            return { success: true };
        } catch (err) {
            return { success: false, error: this.formatZodError(err as ZodError) };
        }
    }

    /**
     * Create a new component.
     * @param data - Component data to create
     * @returns Result with success status and optional error message
     */
    createComponent(data: CreateComponentInput): CreateResult {
        this.ensureCacheLoaded();

        // Check for duplicate ID
        if (this.componentCache.has(data.id)) {
            return { success: false, error: `Component '${data.id}' already exists` };
        }

        // Validate references before schema validation
        const refErrors = this.validateComponentReferences(data);
        if (refErrors.length > 0) {
            return { success: false, error: refErrors.join("; ") };
        }

        // Validate against schema
        try {
            const component = ComponentSchema.parse(data);

            // Write to file
            writeYamlFile(this.componentsPath, component.id, component);

            // Update cache
            this.componentCache.set(component.id, component);

            // Update reverse relationships on capabilities
            this.updateCapabilityReverseRelationships(component);

            return { success: true };
        } catch (err) {
            return { success: false, error: this.formatZodError(err as ZodError) };
        }
    }

    /**
     * Create a new workflow.
     * @param data - Workflow data to create
     * @returns Result with success status and optional error message
     */
    createWorkflow(data: CreateWorkflowInput): CreateResult {
        this.ensureCacheLoaded();

        // Check for duplicate ID
        if (this.workflowCache.has(data.id)) {
            return { success: false, error: `Workflow '${data.id}' already exists` };
        }

        // Validate references before schema validation
        const refErrors = this.validateWorkflowReferences(data);
        if (refErrors.length > 0) {
            return { success: false, error: refErrors.join("; ") };
        }

        // Validate against schema
        try {
            const workflow = WorkflowSchema.parse(data);

            // Write to file
            writeYamlFile(this.workflowsPath, workflow.id, workflow);

            // Update cache
            this.workflowCache.set(workflow.id, workflow);

            // Update reverse relationships
            this.updateWorkflowReverseRelationships(workflow);

            return { success: true };
        } catch (err) {
            return { success: false, error: this.formatZodError(err as ZodError) };
        }
    }

    // ============= VALIDATION HELPERS =============

    /**
     * Validate workflow references (capabilities, personas, components).
     * @param data - Workflow data to validate
     * @returns Array of error messages (empty if all valid)
     */
    private validateWorkflowReferences(data: CreateWorkflowInput): string[] {
        const errors: string[] = [];

        // Check capabilities
        for (const capId of data.requires_capabilities ?? []) {
            if (!this.capabilityCache.has(capId)) {
                errors.push(`Capability '${capId}' does not exist`);
            }
        }

        // Check personas
        for (const personaId of data.personas ?? []) {
            if (!this.personaCache.has(personaId)) {
                errors.push(`Persona '${personaId}' does not exist`);
            }
        }

        // Check components
        for (const compId of data.suggested_components ?? []) {
            if (!this.componentCache.has(compId)) {
                errors.push(`Component '${compId}' does not exist`);
            }
        }

        return errors;
    }

    /**
     * Validate component references (capabilities, workflows, dependencies).
     * @param data - Component data to validate
     * @returns Array of error messages (empty if all valid)
     */
    private validateComponentReferences(data: CreateComponentInput): string[] {
        const errors: string[] = [];

        // Check capabilities
        for (const capId of data.implements_capabilities ?? []) {
            if (!this.capabilityCache.has(capId)) {
                errors.push(`Capability '${capId}' does not exist`);
            }
        }

        // Check workflows
        for (const wfId of data.used_in_workflows ?? []) {
            if (!this.workflowCache.has(wfId)) {
                errors.push(`Workflow '${wfId}' does not exist`);
            }
        }

        // Check component dependencies
        for (const depId of data.dependencies ?? []) {
            if (!this.componentCache.has(depId)) {
                errors.push(`Component '${depId}' does not exist`);
            }
        }

        return errors;
    }

    // ============= REVERSE RELATIONSHIP UPDATES =============

    /**
     * Update reverse relationships when a workflow is created.
     * Updates: capability.used_by_workflows, persona.workflows, component.used_in_workflows
     * @param workflow - The newly created workflow
     */
    private updateWorkflowReverseRelationships(workflow: Workflow): void {
        // Update capabilities' used_by_workflows
        for (const capId of workflow.requires_capabilities) {
            const cap = this.capabilityCache.get(capId);
            if (cap && !cap.used_by_workflows.includes(workflow.id)) {
                cap.used_by_workflows.push(workflow.id);
                // Write updated capability to file
                const filePath = path.join(this.capabilitiesPath, `${cap.id}.yaml`);
                updateYamlFile(filePath, cap);
            }
        }

        // Update personas' workflows
        for (const personaId of workflow.personas) {
            const persona = this.personaCache.get(personaId);
            if (persona && !persona.workflows.includes(workflow.id)) {
                persona.workflows.push(workflow.id);
                // Write updated persona to file
                const filePath = path.join(this.personasPath, `${persona.id}.yaml`);
                updateYamlFile(filePath, persona);
            }
        }

        // Update components' used_in_workflows
        for (const compId of workflow.suggested_components) {
            const comp = this.componentCache.get(compId);
            if (comp && !comp.used_in_workflows.includes(workflow.id)) {
                comp.used_in_workflows.push(workflow.id);
                // Write updated component to file
                const filePath = path.join(this.componentsPath, `${comp.id}.yaml`);
                updateYamlFile(filePath, comp);
            }
        }
    }

    /**
     * Update reverse relationships when a component is created.
     * Updates: capability.implemented_by_components
     * @param component - The newly created component
     */
    private updateCapabilityReverseRelationships(component: Component): void {
        for (const capId of component.implements_capabilities) {
            const cap = this.capabilityCache.get(capId);
            if (cap && !cap.implemented_by_components.includes(component.id)) {
                cap.implemented_by_components.push(component.id);
                // Write updated capability to file
                const filePath = path.join(this.capabilitiesPath, `${cap.id}.yaml`);
                updateYamlFile(filePath, cap);
            }
        }
    }

    // ============= ERROR FORMATTING =============

    /**
     * Format a Zod validation error into a human-readable message.
     * @param error - Zod validation error
     * @returns Formatted error message
     */
    private formatZodError(error: ZodError): string {
        const {issues} = error;
        if (issues.length === 0) {
            return "Validation failed";
        }

        // Return the first issue's message
        const issue = issues[0];
        if (issue.path.length > 0) {
            return `${issue.path.join(".")}: ${issue.message}`;
        }
        return issue.message;
    }

    // ============= UPDATE OPERATIONS =============

    /**
     * Update an existing workflow.
     * @param id - Workflow ID to update
     * @param updates - Fields to update
     * @returns Result with success status and optional error message
     */
    updateWorkflow(id: string, updates: UpdateWorkflowInput): UpdateResult {
        this.ensureCacheLoaded();

        const existing = this.workflowCache.get(id);
        if (!existing) {
            return { success: false, error: `Workflow '${id}' not found` };
        }

        // Validate references if they're being updated
        if (updates.requires_capabilities) {
            for (const capId of updates.requires_capabilities) {
                if (!this.capabilityCache.has(capId)) {
                    return { success: false, error: `Capability '${capId}' does not exist` };
                }
            }
        }
        if (updates.personas) {
            for (const personaId of updates.personas) {
                if (!this.personaCache.has(personaId)) {
                    return { success: false, error: `Persona '${personaId}' does not exist` };
                }
            }
        }
        if (updates.suggested_components) {
            for (const compId of updates.suggested_components) {
                if (!this.componentCache.has(compId)) {
                    return { success: false, error: `Component '${compId}' does not exist` };
                }
            }
        }

        // Track old references for reverse relationship cleanup
        const oldCapabilities = [...existing.requires_capabilities];
        const oldPersonas = [...existing.personas];
        const oldComponents = [...existing.suggested_components];

        // Merge updates with existing data
        const updated: Workflow = {
            ...existing,
            ...updates,
        };

        // Update cache
        this.workflowCache.set(id, updated);

        // Write to file
        const filePath = path.join(this.workflowsPath, `${id}.yaml`);
        updateYamlFile(filePath, updated);

        // Update reverse relationships if references changed
        if (updates.requires_capabilities) {
            this.updateCapabilityWorkflowRefs(id, oldCapabilities, updates.requires_capabilities);
        }
        if (updates.personas) {
            this.updatePersonaWorkflowRefs(id, oldPersonas, updates.personas);
        }
        if (updates.suggested_components) {
            this.updateComponentWorkflowRefs(id, oldComponents, updates.suggested_components);
        }

        return { success: true };
    }

    /**
     * Update an existing capability.
     * @param id - Capability ID to update
     * @param updates - Fields to update
     * @returns Result with success status and optional error message
     */
    updateCapability(id: string, updates: UpdateCapabilityInput): UpdateResult {
        this.ensureCacheLoaded();

        const existing = this.capabilityCache.get(id);
        if (!existing) {
            return { success: false, error: `Capability '${id}' not found` };
        }

        // Merge updates with existing data (preserve relationship fields)
        const updated: Capability = {
            ...existing,
            ...updates,
        };

        // Update cache
        this.capabilityCache.set(id, updated);

        // Write to file
        const filePath = path.join(this.capabilitiesPath, `${id}.yaml`);
        updateYamlFile(filePath, updated);

        return { success: true };
    }

    /**
     * Update an existing persona.
     * @param id - Persona ID to update
     * @param updates - Fields to update
     * @returns Result with success status and optional error message
     */
    updatePersona(id: string, updates: UpdatePersonaInput): UpdateResult {
        this.ensureCacheLoaded();

        const existing = this.personaCache.get(id);
        if (!existing) {
            return { success: false, error: `Persona '${id}' not found` };
        }

        // Merge updates with existing data (preserve relationship fields)
        const updated: Persona = {
            ...existing,
            ...updates,
        };

        // Update cache
        this.personaCache.set(id, updated);

        // Write to file
        const filePath = path.join(this.personasPath, `${id}.yaml`);
        updateYamlFile(filePath, updated);

        return { success: true };
    }

    /**
     * Update an existing component.
     * @param id - Component ID to update
     * @param updates - Fields to update
     * @returns Result with success status and optional error message
     */
    updateComponent(id: string, updates: UpdateComponentInput): UpdateResult {
        this.ensureCacheLoaded();

        const existing = this.componentCache.get(id);
        if (!existing) {
            return { success: false, error: `Component '${id}' not found` };
        }

        // Validate references if they're being updated
        if (updates.implements_capabilities) {
            for (const capId of updates.implements_capabilities) {
                if (!this.capabilityCache.has(capId)) {
                    return { success: false, error: `Capability '${capId}' does not exist` };
                }
            }
        }
        if (updates.dependencies) {
            for (const depId of updates.dependencies) {
                if (!this.componentCache.has(depId)) {
                    return { success: false, error: `Component '${depId}' does not exist` };
                }
            }
        }

        // Track old references for reverse relationship cleanup
        const oldCapabilities = [...existing.implements_capabilities];

        // Merge updates with existing data
        const updated: Component = {
            ...existing,
            ...updates,
        };

        // Update cache
        this.componentCache.set(id, updated);

        // Write to file
        const filePath = path.join(this.componentsPath, `${id}.yaml`);
        updateYamlFile(filePath, updated);

        // Update reverse relationships if capability references changed
        if (updates.implements_capabilities) {
            this.updateCapabilityComponentRefs(id, oldCapabilities, updates.implements_capabilities);
        }

        return { success: true };
    }

    // ============= DELETE OPERATIONS =============

    /**
     * Delete a workflow.
     * @param id - Workflow ID to delete
     * @returns Result with success status and optional error message
     */
    deleteWorkflow(id: string): DeleteResult {
        this.ensureCacheLoaded();

        const existing = this.workflowCache.get(id);
        if (!existing) {
            return { success: false, error: `Workflow '${id}' not found` };
        }

        // Clean up reverse relationships
        this.cleanupWorkflowReferences(existing);

        // Remove from cache
        this.workflowCache.delete(id);

        // Delete file
        const filePath = path.join(this.workflowsPath, `${id}.yaml`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return { success: true };
    }

    /**
     * Delete a capability.
     * @param id - Capability ID to delete
     * @param options - Delete options (force to ignore warnings)
     * @returns Result with success status, optional error message, and warnings
     */
    deleteCapability(id: string, options?: DeleteOptions): DeleteResult {
        this.ensureCacheLoaded();

        const existing = this.capabilityCache.get(id);
        if (!existing) {
            return { success: false, error: `Capability '${id}' not found` };
        }

        // Check for dependents (workflows that require this capability)
        const dependentWorkflows = Array.from(this.workflowCache.values())
            .filter(w => w.requires_capabilities.includes(id))
            .map(w => w.id);

        if (dependentWorkflows.length > 0 && !options?.force) {
            return {
                success: false,
                error: "Cannot delete capability with dependent workflows",
                warnings: dependentWorkflows,
            };
        }

        // If force, clean up references from workflows
        if (options?.force && dependentWorkflows.length > 0) {
            for (const wfId of dependentWorkflows) {
                const wf = this.workflowCache.get(wfId);
                if (wf) {
                    wf.requires_capabilities = wf.requires_capabilities.filter(c => c !== id);
                    const wfPath = path.join(this.workflowsPath, `${wfId}.yaml`);
                    updateYamlFile(wfPath, wf);
                }
            }
        }

        // Remove from cache
        this.capabilityCache.delete(id);

        // Delete file
        const filePath = path.join(this.capabilitiesPath, `${id}.yaml`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return { success: true };
    }

    /**
     * Delete a persona.
     * @param id - Persona ID to delete
     * @param options - Delete options (force to ignore warnings)
     * @returns Result with success status, optional error message, and warnings
     */
    deletePersona(id: string, options?: DeleteOptions): DeleteResult {
        this.ensureCacheLoaded();

        const existing = this.personaCache.get(id);
        if (!existing) {
            return { success: false, error: `Persona '${id}' not found` };
        }

        // Check for dependents (workflows that use this persona)
        const dependentWorkflows = Array.from(this.workflowCache.values())
            .filter(w => w.personas.includes(id))
            .map(w => w.id);

        if (dependentWorkflows.length > 0 && !options?.force) {
            return {
                success: false,
                error: "Cannot delete persona with dependent workflows",
                warnings: dependentWorkflows,
            };
        }

        // If force, clean up references from workflows
        if (options?.force && dependentWorkflows.length > 0) {
            for (const wfId of dependentWorkflows) {
                const wf = this.workflowCache.get(wfId);
                if (wf) {
                    wf.personas = wf.personas.filter(p => p !== id);
                    const wfPath = path.join(this.workflowsPath, `${wfId}.yaml`);
                    updateYamlFile(wfPath, wf);
                }
            }
        }

        // Remove from cache
        this.personaCache.delete(id);

        // Delete file
        const filePath = path.join(this.personasPath, `${id}.yaml`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return { success: true };
    }

    /**
     * Delete a component.
     * @param id - Component ID to delete
     * @param options - Delete options (force to ignore warnings)
     * @returns Result with success status, optional error message, and warnings
     */
    deleteComponent(id: string, options?: DeleteOptions): DeleteResult {
        this.ensureCacheLoaded();

        const existing = this.componentCache.get(id);
        if (!existing) {
            return { success: false, error: `Component '${id}' not found` };
        }

        // Check for dependents
        const dependentWorkflows = Array.from(this.workflowCache.values())
            .filter(w => w.suggested_components.includes(id))
            .map(w => w.id);

        const dependentCapabilities = Array.from(this.capabilityCache.values())
            .filter(c => c.implemented_by_components.includes(id))
            .map(c => c.id);

        const dependentComponents = Array.from(this.componentCache.values())
            .filter(c => c.dependencies.includes(id))
            .map(c => c.id);

        const allDependents = [...dependentWorkflows, ...dependentCapabilities, ...dependentComponents];

        if (allDependents.length > 0 && !options?.force) {
            return {
                success: false,
                error: "Cannot delete component with dependents",
                warnings: allDependents,
            };
        }

        // If force, clean up all references
        if (options?.force) {
            // Clean up workflow references
            for (const wfId of dependentWorkflows) {
                const wf = this.workflowCache.get(wfId);
                if (wf) {
                    wf.suggested_components = wf.suggested_components.filter(c => c !== id);
                    const wfPath = path.join(this.workflowsPath, `${wfId}.yaml`);
                    updateYamlFile(wfPath, wf);
                }
            }

            // Clean up capability references
            for (const capId of dependentCapabilities) {
                const cap = this.capabilityCache.get(capId);
                if (cap) {
                    cap.implemented_by_components = cap.implemented_by_components.filter(c => c !== id);
                    const capPath = path.join(this.capabilitiesPath, `${capId}.yaml`);
                    updateYamlFile(capPath, cap);
                }
            }

            // Clean up component dependency references
            for (const compId of dependentComponents) {
                const comp = this.componentCache.get(compId);
                if (comp) {
                    comp.dependencies = comp.dependencies.filter(c => c !== id);
                    const compPath = path.join(this.componentsPath, `${compId}.yaml`);
                    updateYamlFile(compPath, comp);
                }
            }
        }

        // Remove from cache
        this.componentCache.delete(id);

        // Delete file
        const filePath = path.join(this.componentsPath, `${id}.yaml`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return { success: true };
    }

    // ============= LINK OPERATIONS =============

    /**
     * Link two entities together.
     * @param fromType - Source entity type
     * @param fromId - Source entity ID
     * @param toType - Target entity type
     * @param toId - Target entity ID
     * @param relationship - Type of relationship
     * @returns Result with success status and optional error message
     */
    link(
        fromType: EntityType,
        fromId: string,
        toType: EntityType,
        toId: string,
        relationship: RelationshipType
    ): LinkResult {
        this.ensureCacheLoaded();

        // Validate relationship type for entity combination
        const validationError = this.validateLinkRelationship(fromType, toType, relationship);
        if (validationError) {
            return { success: false, error: validationError };
        }

        // Get source entity
        const sourceExists = this.entityExists(fromType, fromId);
        if (!sourceExists) {
            return { success: false, error: `${this.capitalizeFirst(fromType)} '${fromId}' not found` };
        }

        // Get target entity
        const targetExists = this.entityExists(toType, toId);
        if (!targetExists) {
            return { success: false, error: `${this.capitalizeFirst(toType)} '${toId}' not found` };
        }

        // Perform the link based on relationship type
        return this.performLink(fromType, fromId, toType, toId, relationship);
    }

    /**
     * Unlink two entities.
     * @param fromType - Source entity type
     * @param fromId - Source entity ID
     * @param toType - Target entity type
     * @param toId - Target entity ID
     * @param relationship - Type of relationship
     * @returns Result with success status and optional error message
     */
    unlink(
        fromType: EntityType,
        fromId: string,
        toType: EntityType,
        toId: string,
        relationship: RelationshipType
    ): LinkResult {
        this.ensureCacheLoaded();

        // Validate relationship type for entity combination
        const validationError = this.validateLinkRelationship(fromType, toType, relationship);
        if (validationError) {
            return { success: false, error: validationError };
        }

        // Perform the unlink based on relationship type
        return this.performUnlink(fromType, fromId, toType, toId, relationship);
    }

    // ============= LINK HELPER METHODS =============

    /**
     * Check if an entity exists.
     * @param entityType - Type of entity
     * @param id - Entity ID
     * @returns True if entity exists
     */
    private entityExists(entityType: EntityType, id: string): boolean {
        switch (entityType) {
            case "workflow":
                return this.workflowCache.has(id);
            case "capability":
                return this.capabilityCache.has(id);
            case "persona":
                return this.personaCache.has(id);
            case "component":
                return this.componentCache.has(id);
            default:
                return false;
        }
    }

    /**
     * Capitalize the first letter of a string.
     * @param str - String to capitalize
     * @returns Capitalized string
     */
    private capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Validate that a relationship type is valid for the given entity types.
     * @param fromType - Source entity type
     * @param toType - Target entity type
     * @param relationship - Relationship type
     * @returns Error message if invalid, null if valid
     */
    private validateLinkRelationship(
        fromType: EntityType,
        toType: EntityType,
        relationship: RelationshipType
    ): string | null {
        // Valid combinations:
        // workflow -> capability (requires)
        // workflow -> persona (uses)
        // workflow -> component (suggests)
        // component -> capability (implements)
        // component -> component (depends)

        if (fromType === "workflow" && toType === "capability" && relationship === "requires") {
            return null;
        }
        if (fromType === "workflow" && toType === "persona" && relationship === "uses") {
            return null;
        }
        if (fromType === "workflow" && toType === "component" && relationship === "suggests") {
            return null;
        }
        if (fromType === "component" && toType === "capability" && relationship === "implements") {
            return null;
        }
        if (fromType === "component" && toType === "component" && relationship === "depends") {
            return null;
        }

        return `Invalid relationship '${relationship}' between ${fromType} and ${toType}`;
    }

    /**
     * Perform the actual link operation.
     * @param fromType - Source entity type
     * @param fromId - Source entity ID
     * @param toType - Target entity type
     * @param toId - Target entity ID
     * @param relationship - Relationship type
     * @returns Result with success status
     */
    private performLink(
        fromType: EntityType,
        fromId: string,
        toType: EntityType,
        toId: string,
        relationship: RelationshipType
    ): LinkResult {
        if (fromType === "workflow" && toType === "capability" && relationship === "requires") {
            const workflow = this.workflowCache.get(fromId);
            const capability = this.capabilityCache.get(toId);
            if (!workflow || !capability) {
                return { success: false, error: "Entity not found" };
            }

            if (!workflow.requires_capabilities.includes(toId)) {
                workflow.requires_capabilities.push(toId);
                updateYamlFile(path.join(this.workflowsPath, `${fromId}.yaml`), workflow);
            }
            if (!capability.used_by_workflows.includes(fromId)) {
                capability.used_by_workflows.push(fromId);
                updateYamlFile(path.join(this.capabilitiesPath, `${toId}.yaml`), capability);
            }
            return { success: true };
        }

        if (fromType === "workflow" && toType === "persona" && relationship === "uses") {
            const workflow = this.workflowCache.get(fromId);
            const persona = this.personaCache.get(toId);
            if (!workflow || !persona) {
                return { success: false, error: "Entity not found" };
            }

            if (!workflow.personas.includes(toId)) {
                workflow.personas.push(toId);
                updateYamlFile(path.join(this.workflowsPath, `${fromId}.yaml`), workflow);
            }
            if (!persona.workflows.includes(fromId)) {
                persona.workflows.push(fromId);
                updateYamlFile(path.join(this.personasPath, `${toId}.yaml`), persona);
            }
            return { success: true };
        }

        if (fromType === "workflow" && toType === "component" && relationship === "suggests") {
            const workflow = this.workflowCache.get(fromId);
            const component = this.componentCache.get(toId);
            if (!workflow || !component) {
                return { success: false, error: "Entity not found" };
            }

            if (!workflow.suggested_components.includes(toId)) {
                workflow.suggested_components.push(toId);
                updateYamlFile(path.join(this.workflowsPath, `${fromId}.yaml`), workflow);
            }
            if (!component.used_in_workflows.includes(fromId)) {
                component.used_in_workflows.push(fromId);
                updateYamlFile(path.join(this.componentsPath, `${toId}.yaml`), component);
            }
            return { success: true };
        }

        if (fromType === "component" && toType === "capability" && relationship === "implements") {
            const component = this.componentCache.get(fromId);
            const capability = this.capabilityCache.get(toId);
            if (!component || !capability) {
                return { success: false, error: "Entity not found" };
            }

            if (!component.implements_capabilities.includes(toId)) {
                component.implements_capabilities.push(toId);
                updateYamlFile(path.join(this.componentsPath, `${fromId}.yaml`), component);
            }
            if (!capability.implemented_by_components.includes(fromId)) {
                capability.implemented_by_components.push(fromId);
                updateYamlFile(path.join(this.capabilitiesPath, `${toId}.yaml`), capability);
            }
            return { success: true };
        }

        if (fromType === "component" && toType === "component" && relationship === "depends") {
            const component = this.componentCache.get(fromId);
            if (!component) {
                return { success: false, error: "Entity not found" };
            }

            if (!component.dependencies.includes(toId)) {
                component.dependencies.push(toId);
                updateYamlFile(path.join(this.componentsPath, `${fromId}.yaml`), component);
            }
            return { success: true };
        }

        return { success: false, error: "Unexpected link operation" };
    }

    /**
     * Perform the actual unlink operation.
     * @param fromType - Source entity type
     * @param fromId - Source entity ID
     * @param toType - Target entity type
     * @param toId - Target entity ID
     * @param relationship - Relationship type
     * @returns Result with success status
     */
    private performUnlink(
        fromType: EntityType,
        fromId: string,
        toType: EntityType,
        toId: string,
        relationship: RelationshipType
    ): LinkResult {
        if (fromType === "workflow" && toType === "capability" && relationship === "requires") {
            const workflow = this.workflowCache.get(fromId);
            const capability = this.capabilityCache.get(toId);

            if (workflow) {
                workflow.requires_capabilities = workflow.requires_capabilities.filter(c => c !== toId);
                updateYamlFile(path.join(this.workflowsPath, `${fromId}.yaml`), workflow);
            }
            if (capability) {
                capability.used_by_workflows = capability.used_by_workflows.filter(w => w !== fromId);
                updateYamlFile(path.join(this.capabilitiesPath, `${toId}.yaml`), capability);
            }
            return { success: true };
        }

        if (fromType === "workflow" && toType === "persona" && relationship === "uses") {
            const workflow = this.workflowCache.get(fromId);
            const persona = this.personaCache.get(toId);

            if (workflow) {
                workflow.personas = workflow.personas.filter(p => p !== toId);
                updateYamlFile(path.join(this.workflowsPath, `${fromId}.yaml`), workflow);
            }
            if (persona) {
                persona.workflows = persona.workflows.filter(w => w !== fromId);
                updateYamlFile(path.join(this.personasPath, `${toId}.yaml`), persona);
            }
            return { success: true };
        }

        if (fromType === "workflow" && toType === "component" && relationship === "suggests") {
            const workflow = this.workflowCache.get(fromId);
            const component = this.componentCache.get(toId);

            if (workflow) {
                workflow.suggested_components = workflow.suggested_components.filter(c => c !== toId);
                updateYamlFile(path.join(this.workflowsPath, `${fromId}.yaml`), workflow);
            }
            if (component) {
                component.used_in_workflows = component.used_in_workflows.filter(w => w !== fromId);
                updateYamlFile(path.join(this.componentsPath, `${toId}.yaml`), component);
            }
            return { success: true };
        }

        if (fromType === "component" && toType === "capability" && relationship === "implements") {
            const component = this.componentCache.get(fromId);
            const capability = this.capabilityCache.get(toId);

            if (component) {
                component.implements_capabilities = component.implements_capabilities.filter(c => c !== toId);
                updateYamlFile(path.join(this.componentsPath, `${fromId}.yaml`), component);
            }
            if (capability) {
                capability.implemented_by_components = capability.implemented_by_components.filter(c => c !== fromId);
                updateYamlFile(path.join(this.capabilitiesPath, `${toId}.yaml`), capability);
            }
            return { success: true };
        }

        if (fromType === "component" && toType === "component" && relationship === "depends") {
            const component = this.componentCache.get(fromId);

            if (component) {
                component.dependencies = component.dependencies.filter(c => c !== toId);
                updateYamlFile(path.join(this.componentsPath, `${fromId}.yaml`), component);
            }
            return { success: true };
        }

        return { success: false, error: "Unexpected unlink operation" };
    }

    // ============= REVERSE RELATIONSHIP UPDATE HELPERS =============

    /**
     * Update capability.used_by_workflows when workflow capabilities change.
     * @param workflowId - Workflow ID
     * @param oldRefs - Old capability references
     * @param newRefs - New capability references
     */
    private updateCapabilityWorkflowRefs(workflowId: string, oldRefs: string[], newRefs: string[]): void {
        // Remove from capabilities no longer referenced
        for (const capId of oldRefs) {
            if (!newRefs.includes(capId)) {
                const cap = this.capabilityCache.get(capId);
                if (cap) {
                    cap.used_by_workflows = cap.used_by_workflows.filter(w => w !== workflowId);
                    updateYamlFile(path.join(this.capabilitiesPath, `${capId}.yaml`), cap);
                }
            }
        }
        // Add to newly referenced capabilities
        for (const capId of newRefs) {
            if (!oldRefs.includes(capId)) {
                const cap = this.capabilityCache.get(capId);
                if (cap && !cap.used_by_workflows.includes(workflowId)) {
                    cap.used_by_workflows.push(workflowId);
                    updateYamlFile(path.join(this.capabilitiesPath, `${capId}.yaml`), cap);
                }
            }
        }
    }

    /**
     * Update persona.workflows when workflow personas change.
     * @param workflowId - Workflow ID
     * @param oldRefs - Old persona references
     * @param newRefs - New persona references
     */
    private updatePersonaWorkflowRefs(workflowId: string, oldRefs: string[], newRefs: string[]): void {
        // Remove from personas no longer referenced
        for (const personaId of oldRefs) {
            if (!newRefs.includes(personaId)) {
                const persona = this.personaCache.get(personaId);
                if (persona) {
                    persona.workflows = persona.workflows.filter(w => w !== workflowId);
                    updateYamlFile(path.join(this.personasPath, `${personaId}.yaml`), persona);
                }
            }
        }
        // Add to newly referenced personas
        for (const personaId of newRefs) {
            if (!oldRefs.includes(personaId)) {
                const persona = this.personaCache.get(personaId);
                if (persona && !persona.workflows.includes(workflowId)) {
                    persona.workflows.push(workflowId);
                    updateYamlFile(path.join(this.personasPath, `${personaId}.yaml`), persona);
                }
            }
        }
    }

    /**
     * Update component.used_in_workflows when workflow components change.
     * @param workflowId - Workflow ID
     * @param oldRefs - Old component references
     * @param newRefs - New component references
     */
    private updateComponentWorkflowRefs(workflowId: string, oldRefs: string[], newRefs: string[]): void {
        // Remove from components no longer referenced
        for (const compId of oldRefs) {
            if (!newRefs.includes(compId)) {
                const comp = this.componentCache.get(compId);
                if (comp) {
                    comp.used_in_workflows = comp.used_in_workflows.filter(w => w !== workflowId);
                    updateYamlFile(path.join(this.componentsPath, `${compId}.yaml`), comp);
                }
            }
        }
        // Add to newly referenced components
        for (const compId of newRefs) {
            if (!oldRefs.includes(compId)) {
                const comp = this.componentCache.get(compId);
                if (comp && !comp.used_in_workflows.includes(workflowId)) {
                    comp.used_in_workflows.push(workflowId);
                    updateYamlFile(path.join(this.componentsPath, `${compId}.yaml`), comp);
                }
            }
        }
    }

    /**
     * Update capability.implemented_by_components when component capabilities change.
     * @param componentId - Component ID
     * @param oldRefs - Old capability references
     * @param newRefs - New capability references
     */
    private updateCapabilityComponentRefs(componentId: string, oldRefs: string[], newRefs: string[]): void {
        // Remove from capabilities no longer referenced
        for (const capId of oldRefs) {
            if (!newRefs.includes(capId)) {
                const cap = this.capabilityCache.get(capId);
                if (cap) {
                    cap.implemented_by_components = cap.implemented_by_components.filter(c => c !== componentId);
                    updateYamlFile(path.join(this.capabilitiesPath, `${capId}.yaml`), cap);
                }
            }
        }
        // Add to newly referenced capabilities
        for (const capId of newRefs) {
            if (!oldRefs.includes(capId)) {
                const cap = this.capabilityCache.get(capId);
                if (cap && !cap.implemented_by_components.includes(componentId)) {
                    cap.implemented_by_components.push(componentId);
                    updateYamlFile(path.join(this.capabilitiesPath, `${capId}.yaml`), cap);
                }
            }
        }
    }

    /**
     * Clean up reverse relationships when a workflow is deleted.
     * @param workflow - Workflow being deleted
     */
    private cleanupWorkflowReferences(workflow: Workflow): void {
        // Remove from capabilities' used_by_workflows
        for (const capId of workflow.requires_capabilities) {
            const cap = this.capabilityCache.get(capId);
            if (cap) {
                cap.used_by_workflows = cap.used_by_workflows.filter(w => w !== workflow.id);
                updateYamlFile(path.join(this.capabilitiesPath, `${capId}.yaml`), cap);
            }
        }

        // Remove from personas' workflows
        for (const personaId of workflow.personas) {
            const persona = this.personaCache.get(personaId);
            if (persona) {
                persona.workflows = persona.workflows.filter(w => w !== workflow.id);
                updateYamlFile(path.join(this.personasPath, `${personaId}.yaml`), persona);
            }
        }

        // Remove from components' used_in_workflows
        for (const compId of workflow.suggested_components) {
            const comp = this.componentCache.get(compId);
            if (comp) {
                comp.used_in_workflows = comp.used_in_workflows.filter(w => w !== workflow.id);
                updateYamlFile(path.join(this.componentsPath, `${compId}.yaml`), comp);
            }
        }
    }

    // ============= ANALYSIS OPERATIONS =============

    /**
     * Validate all design documents for consistency.
     * @returns Validation result with errors and warnings
     */
    validate(): ValidationResult {
        this.ensureCacheLoaded();

        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate workflow references
        for (const workflow of this.workflowCache.values()) {
            // Check capability references
            for (const capId of workflow.requires_capabilities) {
                if (!this.capabilityCache.has(capId)) {
                    errors.push(`Workflow ${workflow.id} references non-existent capability '${capId}'`);
                }
            }
            // Check persona references
            for (const personaId of workflow.personas) {
                if (!this.personaCache.has(personaId)) {
                    errors.push(`Workflow ${workflow.id} references non-existent persona '${personaId}'`);
                }
            }
            // Check component references
            for (const compId of workflow.suggested_components) {
                if (!this.componentCache.has(compId)) {
                    errors.push(`Workflow ${workflow.id} references non-existent component '${compId}'`);
                }
            }
        }

        // Validate component references
        for (const component of this.componentCache.values()) {
            // Check capability references
            for (const capId of component.implements_capabilities) {
                if (!this.capabilityCache.has(capId)) {
                    errors.push(`Component ${component.id} references non-existent capability '${capId}'`);
                }
            }
            // Check dependency references
            for (const depId of component.dependencies) {
                if (!this.componentCache.has(depId)) {
                    errors.push(`Component ${component.id} references non-existent component dependency '${depId}'`);
                }
            }
        }

        // Check for orphaned capabilities (not used by any workflow)
        for (const capability of this.capabilityCache.values()) {
            const usedByWorkflows = Array.from(this.workflowCache.values())
                .filter(w => w.requires_capabilities.includes(capability.id));
            if (usedByWorkflows.length === 0) {
                warnings.push(`Capability '${capability.id}' is not used by any workflow`);
            }
        }

        // Check for orphaned components (not used by any workflow)
        for (const component of this.componentCache.values()) {
            const usedByWorkflows = Array.from(this.workflowCache.values())
                .filter(w => w.suggested_components.includes(component.id));
            if (usedByWorkflows.length === 0) {
                warnings.push(`Component '${component.id}' is not used by any workflow`);
            }
        }

        // Check for orphaned personas (not used by any workflow)
        for (const persona of this.personaCache.values()) {
            const usedByWorkflows = Array.from(this.workflowCache.values())
                .filter(w => w.personas.includes(persona.id));
            if (usedByWorkflows.length === 0) {
                warnings.push(`Persona '${persona.id}' is not used by any workflow`);
            }
        }

        // Check for bidirectional relationship inconsistencies
        for (const capability of this.capabilityCache.values()) {
            for (const wfId of capability.used_by_workflows) {
                const workflow = this.workflowCache.get(wfId);
                if (workflow && !workflow.requires_capabilities.includes(capability.id)) {
                    warnings.push(`Capability '${capability.id}' claims to be used by workflow '${wfId}' but workflow doesn't reference it`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Generate a coverage report for all design documents.
     * @returns Coverage report with usage statistics
     */
    coverageReport(): CoverageReport {
        this.ensureCacheLoaded();

        // Calculate implementation status breakdown
        const implementation_status: ImplementationStatus = {
            planned: 0,
            "in-progress": 0,
            implemented: 0,
            deprecated: 0,
        };

        for (const cap of this.capabilityCache.values()) {
            const status = cap.status ?? "planned";
            if (status in implementation_status) {
                implementation_status[status as keyof ImplementationStatus]++;
            }
        }

        // Build capability coverage
        const capability_coverage: CapabilityCoverageEntry[] = [];
        for (const cap of this.capabilityCache.values()) {
            const usedByWorkflows = Array.from(this.workflowCache.values())
                .filter(w => w.requires_capabilities.includes(cap.id));
            const implementedByComponents = Array.from(this.componentCache.values())
                .filter(c => c.implements_capabilities.includes(cap.id));

            capability_coverage.push({
                id: cap.id,
                name: cap.name,
                status: cap.status ?? "planned",
                workflow_count: usedByWorkflows.length,
                component_count: implementedByComponents.length,
            });
        }

        // Build persona coverage
        const persona_coverage: PersonaCoverageEntry[] = [];
        for (const persona of this.personaCache.values()) {
            const usedByWorkflows = Array.from(this.workflowCache.values())
                .filter(w => w.personas.includes(persona.id));

            persona_coverage.push({
                id: persona.id,
                name: persona.name,
                workflow_count: usedByWorkflows.length,
            });
        }

        // Build component coverage
        const component_coverage: ComponentCoverageEntry[] = [];
        for (const comp of this.componentCache.values()) {
            const usedByWorkflows = Array.from(this.workflowCache.values())
                .filter(w => w.suggested_components.includes(comp.id));

            component_coverage.push({
                id: comp.id,
                name: comp.name,
                status: comp.status ?? "planned",
                capability_count: comp.implements_capabilities.length,
                workflow_count: usedByWorkflows.length,
            });
        }

        // Build workflow coverage
        const workflow_coverage: WorkflowCoverageEntry[] = [];
        for (const workflow of this.workflowCache.values()) {
            const missingCapabilities: string[] = [];
            for (const capId of workflow.requires_capabilities) {
                const cap = this.capabilityCache.get(capId);
                if (cap && cap.status !== "implemented") {
                    missingCapabilities.push(capId);
                }
            }

            workflow_coverage.push({
                id: workflow.id,
                name: workflow.name,
                category: workflow.category,
                capabilities_ready: missingCapabilities.length === 0,
                missing_capabilities: missingCapabilities,
            });
        }

        return {
            summary: {
                total_workflows: this.workflowCache.size,
                total_capabilities: this.capabilityCache.size,
                total_personas: this.personaCache.size,
                total_components: this.componentCache.size,
                implementation_status,
            },
            capability_coverage,
            persona_coverage,
            component_coverage,
            workflow_coverage,
        };
    }

    /**
     * Find orphaned entities that are not referenced by workflows.
     * @param entityType - Optional entity type to filter (defaults to all)
     * @returns Orphan result with lists of orphaned entities
     */
    findOrphans(entityType?: EntityType): OrphanResult {
        this.ensureCacheLoaded();

        const result: OrphanResult = {
            capabilities: [],
            personas: [],
            components: [],
        };

        // Find orphaned capabilities
        if (!entityType || entityType === "capability") {
            for (const cap of this.capabilityCache.values()) {
                const usedByWorkflows = Array.from(this.workflowCache.values())
                    .filter(w => w.requires_capabilities.includes(cap.id));
                if (usedByWorkflows.length === 0) {
                    result.capabilities.push({ id: cap.id, name: cap.name });
                }
            }
        }

        // Find orphaned personas
        if (!entityType || entityType === "persona") {
            for (const persona of this.personaCache.values()) {
                const usedByWorkflows = Array.from(this.workflowCache.values())
                    .filter(w => w.personas.includes(persona.id));
                if (usedByWorkflows.length === 0) {
                    result.personas.push({ id: persona.id, name: persona.name });
                }
            }
        }

        // Find orphaned components
        if (!entityType || entityType === "component") {
            for (const comp of this.componentCache.values()) {
                const usedByWorkflows = Array.from(this.workflowCache.values())
                    .filter(w => w.suggested_components.includes(comp.id));
                if (usedByWorkflows.length === 0) {
                    result.components.push({ id: comp.id, name: comp.name });
                }
            }
        }

        return result;
    }

    /**
     * Find gaps in the design documentation.
     * @returns Gap analysis result
     */
    findGaps(): GapAnalysis {
        this.ensureCacheLoaded();

        // Find workflows without capabilities
        const workflows_without_capabilities: Array<{ id: string; name: string }> = [];
        for (const workflow of this.workflowCache.values()) {
            if (workflow.requires_capabilities.length === 0) {
                workflows_without_capabilities.push({ id: workflow.id, name: workflow.name });
            }
        }

        // Find workflows without personas
        const workflows_without_personas: Array<{ id: string; name: string }> = [];
        for (const workflow of this.workflowCache.values()) {
            if (workflow.personas.length === 0) {
                workflows_without_personas.push({ id: workflow.id, name: workflow.name });
            }
        }

        // Find capabilities without components
        const capabilities_without_components: Array<{ id: string; name: string }> = [];
        for (const cap of this.capabilityCache.values()) {
            const implementedByComponents = Array.from(this.componentCache.values())
                .filter(c => c.implements_capabilities.includes(cap.id));
            if (implementedByComponents.length === 0) {
                capabilities_without_components.push({ id: cap.id, name: cap.name });
            }
        }

        // Find categories with few workflows
        const categoryCount: Record<string, number> = {};
        for (const workflow of this.workflowCache.values()) {
            categoryCount[workflow.category] = (categoryCount[workflow.category] ?? 0) + 1;
        }

        const categories_with_few_workflows: CategoryCoverage[] = Object.entries(categoryCount)
            .filter(([_, count]) => count <= 1)
            .map(([category, workflow_count]) => ({ category, workflow_count }));

        return {
            workflows_without_capabilities,
            workflows_without_personas,
            capabilities_without_components,
            categories_with_few_workflows,
        };
    }

    /**
     * Suggest priorities for implementation.
     * @param options - Priority options (focus and limit)
     * @returns Priority suggestions with recommendations
     */
    suggestPriority(options: PriorityOptions): PrioritySuggestions {
        this.ensureCacheLoaded();

        const limit = options.limit ?? 10;
        const recommendations: PriorityRecommendation[] = [];

        if (options.focus === "capability") {
            // Find unimplemented capabilities and score by workflow impact
            for (const cap of this.capabilityCache.values()) {
                if (cap.status === "implemented" || cap.status === "deprecated") {
                    continue;
                }

                const workflowsBlocked = Array.from(this.workflowCache.values())
                    .filter(w => w.requires_capabilities.includes(cap.id))
                    .map(w => w.id);

                const score = workflowsBlocked.length;

                recommendations.push({
                    id: cap.id,
                    name: cap.name,
                    reasoning: `Implementing ${cap.name} would unblock ${workflowsBlocked.length} workflow(s): ${workflowsBlocked.join(", ") || "none"}`,
                    workflows_unblocked: workflowsBlocked,
                    score,
                });
            }

            // Sort by score descending
            recommendations.sort((a, b) => b.score - a.score);
        } else if (options.focus === "workflow") {
            // Find workflows and score by readiness
            for (const workflow of this.workflowCache.values()) {
                let missingCount = 0;
                const workflowsBlocked: string[] = [];

                for (const capId of workflow.requires_capabilities) {
                    const cap = this.capabilityCache.get(capId);
                    if (cap && cap.status !== "implemented") {
                        missingCount++;
                        workflowsBlocked.push(capId);
                    }
                }

                // Score: lower missing count = higher priority (more ready)
                const score = -missingCount; // Negative so lower missing = higher

                recommendations.push({
                    id: workflow.id,
                    name: workflow.name,
                    reasoning: missingCount === 0
                        ? `${workflow.name} is ready to implement - all required capabilities are implemented`
                        : `${workflow.name} is blocked by ${missingCount} capability(ies): ${workflowsBlocked.join(", ")}`,
                    workflows_unblocked: workflowsBlocked,
                    score,
                });
            }

            // Sort by score descending (ready workflows first)
            recommendations.sort((a, b) => b.score - a.score);
        }

        // Calculate summary
        const unimplementedCaps = Array.from(this.capabilityCache.values())
            .filter(c => c.status !== "implemented" && c.status !== "deprecated");

        const blockedWorkflows = Array.from(this.workflowCache.values())
            .filter(w => {
                return w.requires_capabilities.some(capId => {
                    const cap = this.capabilityCache.get(capId);
                    return cap && cap.status !== "implemented";
                });
            });

        return {
            recommendations: recommendations.slice(0, limit),
            summary: {
                total_unimplemented: unimplementedCaps.length,
                total_blocked_workflows: blockedWorkflows.length,
            },
        };
    }

    // ============= TEST GENERATION =============

    /**
     * Generate test scaffolding from a workflow's success criteria.
     * @param workflowId - ID of the workflow to generate tests for
     * @param options - Test generation options (format: vitest or playwright)
     * @returns Generated test code as a string
     */
    generateTests(workflowId: string, options?: TestGenOptions): string {
        this.ensureCacheLoaded();

        const workflow = this.workflowCache.get(workflowId);
        if (!workflow) {
            return `// Error: Workflow '${workflowId}' not found`;
        }

        const format = options?.format ?? "vitest";

        if (format === "playwright") {
            return this.generatePlaywrightTests(workflow);
        }

        return this.generateVitestTests(workflow);
    }

    /**
     * Generate vitest scaffolding for a workflow.
     * @param workflow - Workflow to generate tests for
     * @returns Vitest test code
     */
    private generateVitestTests(workflow: import("../schemas/workflow.js").Workflow): string {
        const lines: string[] = [];

        lines.push("import { describe, expect, it } from 'vitest';");
        lines.push("");
        lines.push(`/**`);
        lines.push(` * Tests for workflow: ${workflow.name}`);
        lines.push(` * Goal: ${workflow.goal}`);
        lines.push(` */`);
        lines.push(`describe('${workflow.id}: ${workflow.name}', () => {`);

        if (workflow.success_criteria.length === 0) {
            lines.push("    // No success criteria defined for this workflow");
            lines.push("    it.todo('Add success criteria to generate test cases');");
        } else {
            for (const criterion of workflow.success_criteria) {
                lines.push("");
                lines.push(`    describe('${criterion.metric}', () => {`);
                lines.push(`        it('should meet target: ${criterion.target}', () => {`);
                lines.push("            // TODO: Implement test for this success criterion");
                lines.push(`            // Metric: ${criterion.metric}`);
                lines.push(`            // Target: ${criterion.target}`);
                lines.push("            expect(true).toBe(true); // Placeholder");
                lines.push("        });");
                lines.push("    });");
            }
        }

        lines.push("});");
        lines.push("");

        return lines.join("\n");
    }

    /**
     * Generate Playwright scaffolding for a workflow.
     * @param workflow - Workflow to generate tests for
     * @returns Playwright test code
     */
    private generatePlaywrightTests(workflow: import("../schemas/workflow.js").Workflow): string {
        const lines: string[] = [];

        lines.push("import { expect, test } from '@playwright/test';");
        lines.push("");
        lines.push(`/**`);
        lines.push(` * E2E Tests for workflow: ${workflow.name}`);
        lines.push(` * Goal: ${workflow.goal}`);
        lines.push(` */`);
        lines.push(`test.describe('${workflow.id}: ${workflow.name}', () => {`);

        // Add starting state as test fixture comment
        if (workflow.starting_state) {
            lines.push("    /**");
            lines.push("     * Starting state:");
            if (workflow.starting_state.data_type) {
                lines.push(`     * - data_type: ${workflow.starting_state.data_type}`);
            }
            if (workflow.starting_state.node_count) {
                lines.push(`     * - node_count: ${workflow.starting_state.node_count}`);
            }
            if (workflow.starting_state.edge_density) {
                lines.push(`     * - edge_density: ${workflow.starting_state.edge_density}`);
            }
            if (workflow.starting_state.user_expertise) {
                lines.push(`     * - user_expertise: ${workflow.starting_state.user_expertise}`);
            }
            lines.push("     */");
            lines.push("");
        }

        if (workflow.success_criteria.length === 0) {
            lines.push("    // No success criteria defined for this workflow");
            lines.push("    test.skip('Add success criteria to generate test cases', async ({ page }) => {");
            lines.push("        // TODO: Define success criteria");
            lines.push("    });");
        } else {
            for (const criterion of workflow.success_criteria) {
                lines.push("");
                lines.push(`    test('${criterion.metric}: ${criterion.target}', async ({ page }) => {`);
                lines.push("        // TODO: Implement test for this success criterion");
                lines.push(`        // Metric: ${criterion.metric}`);
                lines.push(`        // Target: ${criterion.target}`);
                lines.push("");
                lines.push("        // Navigate to the application");
                lines.push("        await page.goto('/');");
                lines.push("");
                lines.push("        // Add test assertions here");
                lines.push("        await expect(page).toHaveTitle(/Expected Title/);");
                lines.push("    });");
            }
        }

        lines.push("});");
        lines.push("");

        return lines.join("\n");
    }

    // ============= DIAGRAM EXPORT =============

    /**
     * Export a Mermaid diagram of entity relationships.
     * @param options - Diagram options (focus entity and depth)
     * @returns Mermaid diagram code
     */
    exportDiagram(options: DiagramOptions): string {
        this.ensureCacheLoaded();

        const { focus } = options;
        const depth = options.depth ?? 1;

        if (focus === "all") {
            return this.exportFullDiagram();
        }

        return this.exportFocusedDiagram(focus, depth);
    }

    /**
     * Export a diagram focused on a single entity and its relationships.
     * @param focusId - ID of the entity to focus on
     * @param depth - How many levels of relationships to include
     * @returns Mermaid diagram code
     */
    private exportFocusedDiagram(focusId: string, depth: number): string {
        // Find the entity
        const workflow = this.workflowCache.get(focusId);
        const capability = this.capabilityCache.get(focusId);
        const persona = this.personaCache.get(focusId);
        const component = this.componentCache.get(focusId);

        if (!workflow && !capability && !persona && !component) {
            return `%% Error: Entity '${focusId}' not found`;
        }

        const lines: string[] = ["graph TD"];
        const visitedNodes = new Set<string>();
        const edges: string[] = [];

        if (workflow) {
            this.addWorkflowToDiagram(workflow, lines, edges, visitedNodes, depth, 0);
        } else if (capability) {
            this.addCapabilityToDiagram(capability, lines, edges, visitedNodes, depth, 0);
        } else if (persona) {
            this.addPersonaToDiagram(persona, lines, edges, visitedNodes, depth, 0);
        } else if (component) {
            this.addComponentToDiagram(component, lines, edges, visitedNodes, depth, 0);
        }

        // Add edges after all nodes
        lines.push("");
        lines.push(...edges);

        return lines.join("\n");
    }

    /**
     * Add a workflow and its relationships to the diagram.
     * @param workflow - The workflow to add
     * @param lines - Array of diagram lines to append to
     * @param edges - Array of edge definitions to append to
     * @param visitedNodes - Set of already visited node IDs
     * @param maxDepth - Maximum relationship depth to traverse
     * @param currentDepth - Current depth in the traversal
     */
    private addWorkflowToDiagram(
        workflow: import("../schemas/workflow.js").Workflow,
        lines: string[],
        edges: string[],
        visitedNodes: Set<string>,
        maxDepth: number,
        currentDepth: number
    ): void {
        if (visitedNodes.has(workflow.id)) {
            return;
        }
        visitedNodes.add(workflow.id);

        // Add workflow node
        lines.push(`    ${workflow.id}["${workflow.id}: ${workflow.name}"]`);

        if (currentDepth >= maxDepth) {
            return;
        }

        // Add capability relationships
        for (const capId of workflow.requires_capabilities) {
            const cap = this.capabilityCache.get(capId);
            if (cap) {
                edges.push(`    ${workflow.id} -->|requires| ${cap.id}`);
                this.addCapabilityToDiagram(cap, lines, edges, visitedNodes, maxDepth, currentDepth + 1);
            }
        }

        // Add persona relationships
        for (const personaId of workflow.personas) {
            const persona = this.personaCache.get(personaId);
            if (persona) {
                edges.push(`    ${workflow.id} -->|uses| ${persona.id}`);
                this.addPersonaToDiagram(persona, lines, edges, visitedNodes, maxDepth, currentDepth + 1);
            }
        }

        // Add component relationships
        for (const compId of workflow.suggested_components) {
            const comp = this.componentCache.get(compId);
            if (comp) {
                edges.push(`    ${workflow.id} -->|suggests| ${comp.id}`);
                this.addComponentToDiagram(comp, lines, edges, visitedNodes, maxDepth, currentDepth + 1);
            }
        }
    }

    /**
     * Add a capability and its relationships to the diagram.
     * @param capability - The capability to add
     * @param lines - Array of diagram lines to append to
     * @param edges - Array of edge definitions to append to
     * @param visitedNodes - Set of already visited node IDs
     * @param maxDepth - Maximum relationship depth to traverse
     * @param currentDepth - Current depth in the traversal
     */
    private addCapabilityToDiagram(
        capability: import("../schemas/capability.js").Capability,
        lines: string[],
        edges: string[],
        visitedNodes: Set<string>,
        maxDepth: number,
        currentDepth: number
    ): void {
        if (visitedNodes.has(capability.id)) {
            return;
        }
        visitedNodes.add(capability.id);

        // Add capability node
        lines.push(`    ${capability.id}["${capability.id}: ${capability.name}"]`);

        if (currentDepth >= maxDepth) {
            return;
        }

        // Add component relationships (which implement this capability)
        for (const comp of this.componentCache.values()) {
            if (comp.implements_capabilities.includes(capability.id)) {
                edges.push(`    ${comp.id} -->|implements| ${capability.id}`);
                this.addComponentToDiagram(comp, lines, edges, visitedNodes, maxDepth, currentDepth + 1);
            }
        }
    }

    /**
     * Add a persona and its relationships to the diagram.
     * @param persona - The persona to add
     * @param lines - Array of diagram lines to append to
     * @param edges - Array of edge definitions to append to
     * @param visitedNodes - Set of already visited node IDs
     * @param _maxDepth - Maximum relationship depth (unused for personas)
     * @param _currentDepth - Current depth in the traversal (unused for personas)
     */
    private addPersonaToDiagram(
        persona: import("../schemas/persona.js").Persona,
        lines: string[],
        edges: string[],
        visitedNodes: Set<string>,
        _maxDepth: number,
        _currentDepth: number
    ): void {
        if (visitedNodes.has(persona.id)) {
            return;
        }
        visitedNodes.add(persona.id);

        // Add persona node
        lines.push(`    ${persona.id}["${persona.id}: ${persona.name}"]`);

        // Personas don't have outgoing relationships in our model
    }

    /**
     * Add a component and its relationships to the diagram.
     * @param component - The component to add
     * @param lines - Array of diagram lines to append to
     * @param edges - Array of edge definitions to append to
     * @param visitedNodes - Set of already visited node IDs
     * @param maxDepth - Maximum relationship depth to traverse
     * @param currentDepth - Current depth in the traversal
     */
    private addComponentToDiagram(
        component: import("../schemas/component.js").Component,
        lines: string[],
        edges: string[],
        visitedNodes: Set<string>,
        maxDepth: number,
        currentDepth: number
    ): void {
        if (visitedNodes.has(component.id)) {
            return;
        }
        visitedNodes.add(component.id);

        // Add component node
        lines.push(`    ${component.id}["${component.id}: ${component.name}"]`);

        if (currentDepth >= maxDepth) {
            return;
        }

        // Add capability relationships
        for (const capId of component.implements_capabilities) {
            const cap = this.capabilityCache.get(capId);
            if (cap && !visitedNodes.has(cap.id)) {
                edges.push(`    ${component.id} -->|implements| ${cap.id}`);
                this.addCapabilityToDiagram(cap, lines, edges, visitedNodes, maxDepth, currentDepth + 1);
            }
        }

        // Add component dependency relationships
        for (const depId of component.dependencies) {
            const dep = this.componentCache.get(depId);
            if (dep && !visitedNodes.has(dep.id)) {
                edges.push(`    ${component.id} -->|depends| ${dep.id}`);
                this.addComponentToDiagram(dep, lines, edges, visitedNodes, maxDepth, currentDepth + 1);
            }
        }
    }

    /**
     * Export a full diagram with all entities organized in subgraphs.
     * @returns Mermaid diagram code
     */
    private exportFullDiagram(): string {
        const lines: string[] = ["graph TD"];
        const edges: string[] = [];

        // Subgraph for workflows
        lines.push("");
        lines.push("    subgraph Workflows");
        for (const workflow of this.workflowCache.values()) {
            lines.push(`        ${workflow.id}["${workflow.id}: ${workflow.name}"]`);
        }
        lines.push("    end");

        // Subgraph for capabilities
        lines.push("");
        lines.push("    subgraph Capabilities");
        for (const cap of this.capabilityCache.values()) {
            lines.push(`        ${cap.id}["${cap.id}: ${cap.name}"]`);
        }
        lines.push("    end");

        // Subgraph for personas
        lines.push("");
        lines.push("    subgraph Personas");
        for (const persona of this.personaCache.values()) {
            lines.push(`        ${persona.id}["${persona.id}: ${persona.name}"]`);
        }
        lines.push("    end");

        // Subgraph for components
        lines.push("");
        lines.push("    subgraph Components");
        for (const comp of this.componentCache.values()) {
            lines.push(`        ${comp.id}["${comp.id}: ${comp.name}"]`);
        }
        lines.push("    end");

        // Add all edges
        lines.push("");

        // Workflow -> Capability edges
        for (const workflow of this.workflowCache.values()) {
            for (const capId of workflow.requires_capabilities) {
                if (this.capabilityCache.has(capId)) {
                    edges.push(`    ${workflow.id} -->|requires| ${capId}`);
                }
            }
            for (const personaId of workflow.personas) {
                if (this.personaCache.has(personaId)) {
                    edges.push(`    ${workflow.id} -->|uses| ${personaId}`);
                }
            }
            for (const compId of workflow.suggested_components) {
                if (this.componentCache.has(compId)) {
                    edges.push(`    ${workflow.id} -->|suggests| ${compId}`);
                }
            }
        }

        // Component -> Capability edges
        for (const comp of this.componentCache.values()) {
            for (const capId of comp.implements_capabilities) {
                if (this.capabilityCache.has(capId)) {
                    edges.push(`    ${comp.id} -->|implements| ${capId}`);
                }
            }
            for (const depId of comp.dependencies) {
                if (this.componentCache.has(depId)) {
                    edges.push(`    ${comp.id} -->|depends| ${depId}`);
                }
            }
        }

        lines.push(...edges);

        return lines.join("\n");
    }
}
