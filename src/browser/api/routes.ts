/**
 * API routes for the Designloom browser.
 * Exposes DesignDocsStore data as JSON endpoints.
 */

/* eslint-disable camelcase -- snake_case matches YAML field names and store filter types */

import { type Request, type Response,Router } from "express";

import type { DesignDocsStore } from "../../store/yaml-store.js";

// Helper to safely get a string param from Express request
function getParam(req: Request, name: string): string {
    const value = req.params[name];
    return Array.isArray(value) ? value[0] : value;
}

/**
 * Creates Express routes for all entity types.
 * @param store - The DesignDocsStore instance to query
 * @returns Router with all API routes mounted
 */
export function createRoutes(store: DesignDocsStore): Router {
    const router = Router();

    // Stats endpoint for index page
    router.get("/stats", (_req: Request, res: Response) => {
        const stats = {
            workflows: store.listWorkflows().length,
            capabilities: store.listCapabilities().length,
            personas: store.listPersonas().length,
            components: store.listComponents().length,
            tokens: store.listTokens().length,
            views: store.listViews().length,
            interactions: store.listInteractions().length,
        };
        res.json(stats);
    });

    // Workflows
    router.get("/workflows", (req: Request, res: Response) => {
        const filters: {
            category?: string;
            validated?: boolean;
            persona?: string;
            capability?: string;
        } = {};

        if (typeof req.query.category === "string") {
            filters.category = req.query.category;
        }
        if (req.query.validated === "true") {
            filters.validated = true;
        } else if (req.query.validated === "false") {
            filters.validated = false;
        }
        if (typeof req.query.persona === "string") {
            filters.persona = req.query.persona;
        }
        if (typeof req.query.capability === "string") {
            filters.capability = req.query.capability;
        }

        res.json(store.listWorkflows(filters));
    });

    router.get("/workflows/:id", (req: Request, res: Response) => {
        const workflow = store.getWorkflow(getParam(req, "id"));
        if (!workflow) {
            res.status(404).json({ error: "Workflow not found" });
            return;
        }
        res.json(workflow);
    });

    // Capabilities
    router.get("/capabilities", (req: Request, res: Response) => {
        const filters: {
            category?: string;
            status?: string;
            workflow?: string;
        } = {};

        if (typeof req.query.category === "string") {
            filters.category = req.query.category;
        }
        if (typeof req.query.status === "string") {
            filters.status = req.query.status;
        }
        if (typeof req.query.workflow === "string") {
            filters.workflow = req.query.workflow;
        }

        res.json(store.listCapabilities(filters));
    });

    router.get("/capabilities/:id", (req: Request, res: Response) => {
        const capability = store.getCapability(getParam(req, "id"));
        if (!capability) {
            res.status(404).json({ error: "Capability not found" });
            return;
        }
        res.json(capability);
    });

    // Personas
    router.get("/personas", (_req: Request, res: Response) => {
        res.json(store.listPersonas());
    });

    router.get("/personas/:id", (req: Request, res: Response) => {
        const persona = store.getPersona(getParam(req, "id"));
        if (!persona) {
            res.status(404).json({ error: "Persona not found" });
            return;
        }
        res.json(persona);
    });

    // Components
    router.get("/components", (req: Request, res: Response) => {
        const filters: {
            category?: string;
            status?: string;
            capability?: string;
        } = {};

        if (typeof req.query.category === "string") {
            filters.category = req.query.category;
        }
        if (typeof req.query.status === "string") {
            filters.status = req.query.status;
        }
        if (typeof req.query.capability === "string") {
            filters.capability = req.query.capability;
        }

        res.json(store.listComponents(filters));
    });

    router.get("/components/:id", (req: Request, res: Response) => {
        const component = store.getComponent(getParam(req, "id"));
        if (!component) {
            res.status(404).json({ error: "Component not found" });
            return;
        }
        res.json(component);
    });

    // Tokens
    router.get("/tokens", (req: Request, res: Response) => {
        const filters: { extends?: string } = {};

        if (typeof req.query.extends === "string") {
            filters.extends = req.query.extends;
        }

        res.json(store.listTokens(filters));
    });

    router.get("/tokens/:id", (req: Request, res: Response) => {
        const tokens = store.getTokens(getParam(req, "id"));
        if (!tokens) {
            res.status(404).json({ error: "Tokens not found" });
            return;
        }
        res.json(tokens);
    });

    // Views
    router.get("/views", (req: Request, res: Response) => {
        const filters: {
            layout_type?: string;
            workflow?: string;
            has_route?: boolean;
        } = {};

        if (typeof req.query.layout_type === "string") {
            filters.layout_type = req.query.layout_type;
        }
        if (typeof req.query.workflow === "string") {
            filters.workflow = req.query.workflow;
        }
        if (req.query.has_route === "true") {
            filters.has_route = true;
        } else if (req.query.has_route === "false") {
            filters.has_route = false;
        }

        res.json(store.listViews(filters));
    });

    router.get("/views/:id", (req: Request, res: Response) => {
        const view = store.getView(getParam(req, "id"));
        if (!view) {
            res.status(404).json({ error: "View not found" });
            return;
        }
        res.json(view);
    });

    // Interactions
    router.get("/interactions", (req: Request, res: Response) => {
        const filters: { applies_to?: string } = {};

        if (typeof req.query.applies_to === "string") {
            filters.applies_to = req.query.applies_to;
        }

        res.json(store.listInteractions(filters));
    });

    router.get("/interactions/:id", (req: Request, res: Response) => {
        const interaction = store.getInteraction(getParam(req, "id"));
        if (!interaction) {
            res.status(404).json({ error: "Interaction not found" });
            return;
        }
        res.json(interaction);
    });

    return router;
}
