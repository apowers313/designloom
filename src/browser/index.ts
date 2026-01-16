/**
 * Designloom Browser - Web interface for exploring design artifacts.
 * Starts both an API server and a Vite dev server for the React frontend.
 */

/* eslint-disable no-console -- CLI tool needs console output for user feedback */

import open from "open";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "vite";

import { createApiServer } from "./api/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the source directory for the frontend (Vite needs source files, not compiled)
// When running from dist/, we need to go back to src/
const getFrontendDir = (): string => {
    // Check if we're running from dist or src
    if (__dirname.includes("/dist/")) {
        // Running from dist/browser, point to src/browser/frontend
        return __dirname.replace("/dist/browser", "/src/browser/frontend");
    }
    // Running from src (dev mode)
    return path.join(__dirname, "frontend");
};

export interface BrowserOptions {
    port: number;
    open: boolean;
}

/**
 * Starts the Designloom browser interface.
 * @param dataPath - Path to the design documents directory
 * @param options - Browser configuration options
 */
export async function startBrowser(
    dataPath: string,
    options: BrowserOptions
): Promise<void> {
    const { port, open: shouldOpen } = options;
    const frontendPort = port + 1;

    console.log("[designloom] Starting browser interface...");
    console.log(`[designloom] Data path: ${dataPath}`);

    // Start API server
    const apiServer = await createApiServer({ port, dataPath });

    // Get frontend directory path (source files for Vite dev server)
    const frontendDir = getFrontendDir();

    // Start Vite dev server
    const viteServer = await createServer({
        configFile: path.join(frontendDir, "vite.config.ts"),
        root: frontendDir,
        server: {
            port: frontendPort,
            strictPort: true,
            open: false, // We handle this ourselves
        },
        define: {
            "import.meta.env.VITE_API_URL": JSON.stringify(
                `http://localhost:${port}`
            ),
        },
    });

    await viteServer.listen();

    console.log(
        `[designloom] Frontend running on http://localhost:${frontendPort}`
    );

    // Handle graceful shutdown
    const shutdown = (): void => {
        console.log("\n[designloom] Shutting down...");
        void Promise.all([viteServer.close(), apiServer.close()]).then(() => {
            process.exit(0);
        });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    // Open browser
    if (shouldOpen) {
        await open(`http://localhost:${frontendPort}`);
    }

    console.log("[designloom] Press Ctrl+C to stop");
}
