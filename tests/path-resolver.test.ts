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

    beforeEach(async () => {
        vi.resetModules();
        mockExecSync.mockReset();
        // Re-import after resetting
        const module = await import("../src/path-resolver.js");
        getMainRepoPath = module.getMainRepoPath;
        isInWorktree = module.isInWorktree;
        resolveDataPath = module.resolveDataPath;
    });

    afterEach(() => {
        vi.restoreAllMocks();
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
