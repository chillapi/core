import { ModuleLoader, OpenAPIV3 } from '@chillapi/api';
import { load } from '@chillapi/module-discovery';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { safeLoad } from 'js-yaml';


export async function generate(apiPath: OpenAPIV3, rootPath: string, moduleName?: string): Promise<void> {
    try {
        const api = await loadApi(this.config.apiPath);
        const module: ModuleLoader = moduleName ? require(moduleName) : this.loadModule();
        await module.generateStubs(api, rootPath);
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

export function loadModule(): ModuleLoader {
    const chillAPIModulesWithGenerate: ModuleLoader[] = load('generateStubs');
    if (chillAPIModulesWithGenerate.length === 0) {
        throw new Error("No seed generator found within project dependencies. Try adding '@chillapi/stub' to your project.json.");
    }
    if (chillAPIModulesWithGenerate.length > 1) {
        throw new Error(`Multiple seed generators found: ${chillAPIModulesWithGenerate.join(';')}. Run the generate command with a specific module, or leave only one seed generator.`)
    }
    return chillAPIModulesWithGenerate[0];
}

export async function loadApi(apiPath: string): Promise<OpenAPIV3> {
    if (existsSync(apiPath)) {
        try {
            const apiContent = await readFile(apiPath, 'utf-8');
            return safeLoad(apiContent) as OpenAPIV3;
        } catch (err) {
            console.error(`Unable to load API file from ${apiPath}`);
            console.error(err);
            return Promise.reject(err);
        }
    }
}