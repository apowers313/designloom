import * as fs from "node:fs";
import * as path from "node:path";

import { stringify as stringifyYaml } from "yaml";

/**
 * Write an entity to a YAML file.
 * @param dirPath - Directory path to write to
 * @param id - Entity ID (used as filename)
 * @param data - Entity data to serialize
 */
export function writeYamlFile(dirPath: string, id: string, data: object): void {
    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, `${id}.yaml`);
    const content = stringifyYaml(data, {
        indent: 2,
        lineWidth: 120,
    });
    fs.writeFileSync(filePath, content, "utf-8");
}

/**
 * Update an existing YAML file by writing data back.
 * @param filePath - Path to the YAML file
 * @param data - Entity data to serialize
 */
export function updateYamlFile(filePath: string, data: object): void {
    const content = stringifyYaml(data, {
        indent: 2,
        lineWidth: 120,
    });
    fs.writeFileSync(filePath, content, "utf-8");
}
