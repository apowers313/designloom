import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        pool: "forks",
        testTimeout: 30000,
        hookTimeout: 60000,
        include: ["tests/**/*.test.ts"],
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/.{idea,git,cache,output,temp}/**",
        ],
        coverage: {
            all: true,
            provider: "v8",
            reporter: ["text", "json-summary", "json", "lcov", "html"],
            reportsDirectory: "coverage",
            include: ["src/**/*.ts"],
            exclude: [
                "**/*.d.ts",
                "**/*.test.ts",
                "**/*.spec.ts",
                "**/types/**",
                // Browser UI and CLI entry points are integration-level code
                // that require running actual servers to test meaningfully
                "src/browser/**",
                "src/cli.ts",
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 75,
                statements: 80,
            },
        },
        reporters: ["verbose"],
        slowTestThreshold: 5000,
        teardownTimeout: 10000,
    },
    resolve: {
        alias: {
            "@": "/src",
        },
    },
});
