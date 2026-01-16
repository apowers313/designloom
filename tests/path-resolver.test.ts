import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock execSync before any imports
const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
    execSync: (...args: unknown[]) => mockExecSync(...args),
}));

describe("Path Resolver", () => {
    // We need to dynamically import the module after setting up mocks
    let getMainRepoPath: () => string | null;
    let isInWorktree: () => boolean;
    let resolveDataPath: (configuredPath: string) => string;
    let originalCwd: () => string;
    let originalEnvGitCwd: string | undefined;

    beforeEach(async () => {
        vi.resetModules();
        mockExecSync.mockReset();
        originalCwd = process.cwd;
        originalEnvGitCwd = process.env.DESIGNLOOM_GIT_CWD;
        delete process.env.DESIGNLOOM_GIT_CWD;
        // Re-import after resetting
        const module = await import("../src/path-resolver.js");
        getMainRepoPath = module.getMainRepoPath;
        isInWorktree = module.isInWorktree;
        resolveDataPath = module.resolveDataPath;
    });

    afterEach(() => {
        process.cwd = originalCwd;
        if (originalEnvGitCwd !== undefined) {
            process.env.DESIGNLOOM_GIT_CWD = originalEnvGitCwd;
        } else {
            delete process.env.DESIGNLOOM_GIT_CWD;
        }
        vi.restoreAllMocks();
    });

    describe("execGitCommand cwd behavior (regression test for MCP spawned process)", () => {
        it("passes cwd to execSync to ensure correct working directory in spawned processes", () => {
            // This test verifies the fix for a bug where MCP-spawned processes
            // would fail to detect git worktrees because execSync was not
            // explicitly given a cwd, causing git commands to run from the
            // wrong directory in certain spawn contexts.
            const testCwd = "/test/worktree/path";
            process.cwd = () => testCwd;

            mockExecSync.mockImplementation((cmd: string) => {
                if (cmd.includes("--git-dir")) {
                    return ".git\n";
                }
                if (cmd.includes("--git-common-dir")) {
                    return ".git\n";
                }
                return "";
            });

            isInWorktree();

            // Verify that execSync was called with cwd option set to process.cwd()
            expect(mockExecSync).toHaveBeenCalled();
            const calls = mockExecSync.mock.calls;
            for (const call of calls) {
                const options = call[1] as { cwd?: string };
                expect(options.cwd).toBe(testCwd);
            }
        });

        it("uses DESIGNLOOM_GIT_CWD env variable when set (MCP workaround)", async () => {
            // This test verifies that DESIGNLOOM_GIT_CWD takes precedence over process.cwd()
            // This is needed because some MCP clients don't properly respect the cwd setting
            const envCwd = "/env/worktree/path";
            const processCwd = "/different/process/path";

            process.env.DESIGNLOOM_GIT_CWD = envCwd;
            process.cwd = () => processCwd;

            // Need to re-import after setting env variable
            vi.resetModules();
            const module = await import("../src/path-resolver.js");

            mockExecSync.mockImplementation((cmd: string) => {
                if (cmd.includes("--git-dir")) {
                    return ".git\n";
                }
                if (cmd.includes("--git-common-dir")) {
                    return ".git\n";
                }
                return "";
            });

            module.isInWorktree();

            // Verify that execSync was called with cwd from env variable, not process.cwd()
            expect(mockExecSync).toHaveBeenCalled();
            const calls = mockExecSync.mock.calls;
            for (const call of calls) {
                const options = call[1] as { cwd?: string };
                expect(options.cwd).toBe(envCwd);
            }
        });

        it("resolves data path using DESIGNLOOM_GIT_CWD when not in worktree", async () => {
            // Verify that resolveDataPath uses the env variable for fallback resolution
            const envCwd = "/env/worktree/path";

            process.env.DESIGNLOOM_GIT_CWD = envCwd;
            process.cwd = () => "/different/process/path";

            // Re-import after setting env variable
            vi.resetModules();
            const module = await import("../src/path-resolver.js");

            mockExecSync.mockImplementation(() => {
                throw new Error("fatal: not a git repository");
            });

            const resolved = module.resolveDataPath("./design/designloom");
            expect(resolved).toBe(path.resolve(envCwd, "./design/designloom"));
        });
    });

    describe("isInWorktree", () => {
        it("returns false when git-dir equals git-common-dir", () => {
            mockExecSync.mockImplementation((cmd: string) => {
                if (cmd.includes("--git-dir")) {
                    return ".git\n";
                }
                if (cmd.includes("--git-common-dir")) {
                    return ".git\n";
                }
                return "";
            });

            expect(isInWorktree()).toBe(false);
        });

        it("returns true when git-dir differs from git-common-dir (worktree)", () => {
            mockExecSync.mockImplementation((cmd: string) => {
                if (cmd.includes("--git-dir")) {
                    return "/repo/.git/worktrees/feature\n";
                }
                if (cmd.includes("--git-common-dir")) {
                    return "/repo/.git\n";
                }
                return "";
            });

            expect(isInWorktree()).toBe(true);
        });

        it("returns false when not in a git repository", () => {
            mockExecSync.mockImplementation(() => {
                throw new Error("fatal: not a git repository");
            });

            expect(isInWorktree()).toBe(false);
        });
    });

    describe("getMainRepoPath", () => {
        it("returns main repo path when in worktree", () => {
            mockExecSync.mockImplementation((cmd: string) => {
                if (cmd.includes("--git-dir")) {
                    return "/repo/.git/worktrees/feature\n";
                }
                if (cmd.includes("--git-common-dir")) {
                    return "/repo/.git\n";
                }
                return "";
            });

            expect(getMainRepoPath()).toBe("/repo");
        });

        it("returns null when not in worktree (main repo)", () => {
            mockExecSync.mockImplementation((cmd: string) => {
                if (cmd.includes("--git-dir")) {
                    return ".git\n";
                }
                if (cmd.includes("--git-common-dir")) {
                    return ".git\n";
                }
                return "";
            });

            expect(getMainRepoPath()).toBe(null);
        });

        it("returns null when not in a git repository", () => {
            mockExecSync.mockImplementation(() => {
                throw new Error("fatal: not a git repository");
            });

            expect(getMainRepoPath()).toBe(null);
        });
    });

    describe("resolveDataPath", () => {
        it("resolves path in main repo (not worktree)", () => {
            const originalCwd = process.cwd;
            process.cwd = () => "/current/worktree";
            mockExecSync.mockImplementation((cmd: string) => {
                if (cmd.includes("--git-dir")) {
                    return ".git\n";
                }
                if (cmd.includes("--git-common-dir")) {
                    return ".git\n";
                }
                return "";
            });

            try {
                const resolved = resolveDataPath("./design/designloom");
                // Should resolve relative to current directory
                expect(resolved).toBe(path.resolve("/current/worktree", "./design/designloom"));
            } finally {
                process.cwd = originalCwd;
            }
        });

        it("resolves worktree path to main repo", () => {
            const originalCwd = process.cwd;
            process.cwd = () => "/current/worktree";
            mockExecSync.mockImplementation((cmd: string) => {
                if (cmd.includes("--git-dir")) {
                    return "/repo/.git/worktrees/feature\n";
                }
                if (cmd.includes("--git-common-dir")) {
                    return "/repo/.git\n";
                }
                return "";
            });

            try {
                const resolved = resolveDataPath("./design/designloom");
                // Should resolve relative to main repo
                expect(resolved).toBe(path.join("/repo", "design/designloom"));
            } finally {
                process.cwd = originalCwd;
            }
        });

        it("handles absolute paths by returning them as-is", () => {
            mockExecSync.mockImplementation((cmd: string) => {
                if (cmd.includes("--git-dir")) {
                    return ".git\n";
                }
                if (cmd.includes("--git-common-dir")) {
                    return ".git\n";
                }
                return "";
            });

            const absolutePath = "/absolute/path/to/design";
            const resolved = resolveDataPath(absolutePath);

            expect(resolved).toBe(absolutePath);
        });

        it("handles non-git directory gracefully", () => {
            const originalCwd = process.cwd;
            process.cwd = () => "/current/worktree";
            mockExecSync.mockImplementation(() => {
                throw new Error("fatal: not a git repository");
            });

            try {
                const resolved = resolveDataPath("./design/designloom");
                // Should resolve relative to current directory
                expect(resolved).toBe(path.resolve("/current/worktree", "./design/designloom"));
            } finally {
                process.cwd = originalCwd;
            }
        });

        it("handles paths without leading ./", () => {
            const originalCwd = process.cwd;
            process.cwd = () => "/current/worktree";
            mockExecSync.mockImplementation((cmd: string) => {
                if (cmd.includes("--git-dir")) {
                    return "/repo/.git/worktrees/feature\n";
                }
                if (cmd.includes("--git-common-dir")) {
                    return "/repo/.git\n";
                }
                return "";
            });

            try {
                const resolved = resolveDataPath("design/designloom");
                // Should resolve relative to main repo
                expect(resolved).toBe(path.join("/repo", "design/designloom"));
            } finally {
                process.cwd = originalCwd;
            }
        });
    });
});
