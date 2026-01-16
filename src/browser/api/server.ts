/**
 * Express API server for Designloom browser.
 * Provides JSON endpoints for all entity types and SSE for live reload.
 */

/* eslint-disable no-console -- CLI tool needs console output for user feedback */

import { type FSWatcher,watch } from "chokidar";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import type { Server } from "http";

import { DesignDocsStore } from "../../store/yaml-store.js";
import { createRoutes } from "./routes.js";

export interface ApiServerOptions {
    port: number;
    dataPath: string;
}

export interface ApiServer {
    app: Express;
    server: Server;
    store: DesignDocsStore;
    watcher: FSWatcher;
    close: () => Promise<void>;
}

// Keep track of SSE clients for live reload
const sseClients: Set<Response> = new Set();

/**
 * Creates and starts the API server.
 * Includes file watching for live reload.
 * @param options - Server configuration options (port and data path)
 * @returns The API server instance with close method for cleanup
 */
export async function createApiServer(
    options: ApiServerOptions
): Promise<ApiServer> {
    const { port, dataPath } = options;

    const store = new DesignDocsStore(dataPath);
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Mount API routes
    app.use("/api", createRoutes(store));

    // SSE endpoint for live reload
    app.get("/api/events", (req: Request, res: Response) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        // Add client to set
        sseClients.add(res);

        // Send initial connection message
        res.write("data: connected\n\n");

        // Handle client disconnect
        req.on("close", () => {
            sseClients.delete(res);
        });
    });

    // Set up file watcher for YAML changes
    const watcher = watch(`${dataPath}/**/*.yaml`, {
        ignoreInitial: true,
        persistent: true,
    });

    watcher.on("all", (event, path) => {
        console.log(`[designloom] File ${event}: ${path}`);

        // Refresh store cache
        store.refresh();

        // Notify all SSE clients
        for (const client of sseClients) {
            client.write(`data: ${JSON.stringify({ event, path })}\n\n`);
        }
    });

    // Start server
    const server = await new Promise<Server>((resolve) => {
        const s = app.listen(port, () => {
            console.log(`[designloom] API server running on http://localhost:${port}`);
            resolve(s);
        });
    });

    return {
        app,
        server,
        store,
        watcher,
        close: async () => {
            await watcher.close();
            await new Promise<void>((resolve, reject) => {
                server.close((err) => {
                    if (err) {reject(err);}
                    else {resolve();}
                });
            });
        },
    };
}
