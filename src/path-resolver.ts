import { execSync } from "node:child_process";
import * as path from "node:path";

/**
 * Get the working directory to use for git commands.
 * Uses DESIGNLOOM_GIT_CWD env variable if set (for MCP servers where cwd may not be respected),
 * otherwise falls back to process.cwd().
 * @returns Directory path to use for git operations
 */
function getGitWorkingDirectory(): string {
    return process.env.DESIGNLOOM_GIT_CWD ?? process.cwd();
}

/**
 * Execute a git command and return the trimmed output.
 * Uses getGitWorkingDirectory() to ensure correct working directory in spawned processes (e.g., MCP servers).
 * @param command - Git command arguments
 * @returns Output string or null on error
 */
function execGitCommand(command: string): string | null {
    try {
        const result = execSync(command, {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"],
            cwd: getGitWorkingDirectory(),
        });
        return result.trim();
    } catch {
        return null;
    }
}

/**
 * Check if the current directory is in a git worktree (not the main repo).
 * @returns True if in a worktree, false otherwise
 */
export function isInWorktree(): boolean {
    const gitDir = execGitCommand("git rev-parse --git-dir");
    const gitCommonDir = execGitCommand("git rev-parse --git-common-dir");

    if (gitDir === null || gitCommonDir === null) {
        return false;
    }

    // If git-dir differs from git-common-dir, we're in a worktree
    return gitDir !== gitCommonDir;
}

/**
 * Get the path to the main repository when in a worktree.
 * @returns Path to main repo, or null if not in a worktree or not a git repo
 */
export function getMainRepoPath(): string | null {
    if (!isInWorktree()) {
        return null;
    }

    const gitCommonDir = execGitCommand("git rev-parse --git-common-dir");
    if (gitCommonDir === null) {
        return null;
    }

    // The common dir is typically /path/to/repo/.git
    // We need to return /path/to/repo
    return path.dirname(gitCommonDir);
}

/**
 * Resolve a data path, taking into account git worktrees.
 * When in a worktree, relative paths are resolved to the main repository.
 * Absolute paths are returned as-is.
 * @param configuredPath - The configured path (absolute or relative)
 * @returns Resolved absolute path
 */
export function resolveDataPath(configuredPath: string): string {
    // If it's already an absolute path, return as-is
    if (path.isAbsolute(configuredPath)) {
        return configuredPath;
    }

    // Check if we're in a worktree
    const mainRepoPath = getMainRepoPath();

    if (mainRepoPath !== null) {
        // We're in a worktree - resolve relative to main repo
        // Remove leading ./ if present
        const normalizedPath = configuredPath.startsWith("./")
            ? configuredPath.slice(2)
            : configuredPath;
        return path.join(mainRepoPath, normalizedPath);
    }

    // Not in a worktree (or not a git repo) - resolve relative to git working directory
    return path.resolve(getGitWorkingDirectory(), configuredPath);
}
