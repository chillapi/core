import { ModuleLoader, OpenAPIV3 } from '@chillapi/api';
import { load } from '@chillapi/module-discovery/dist';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { load as yamlLoad } from 'js-yaml';


export async function generate(apiPath: string, rootPath: string, moduleName?: string): Promise<void> {
    try {
        const api = await loadApi(apiPath);
        const module: ModuleLoader = moduleName ? require(moduleName) : await this.loadModule();
        await module.generateStubs(api, rootPath);
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

export async function loadModule(): Promise<ModuleLoader> {
    const chillAPIModulesWithGenerate: ModuleLoader[] = await load('generateStubs');
    if (chillAPIModulesWithGenerate.length === 0) {
        return Promise.reject("No seed generator found within project dependencies. Try adding '@chillapi/stub' to your project.json.");
    }
    if (chillAPIModulesWithGenerate.length > 1) {
        return Promise.reject(`Multiple seed generators found: ${chillAPIModulesWithGenerate.join(';')}. Run the generate command with a specific module, or leave only one seed generator.`)
    }
    return Promise.resolve(chillAPIModulesWithGenerate[0]);
}

export async function loadApi(apiPath: string): Promise<OpenAPIV3> {
    if (existsSync(apiPath)) {
        try {
            const apiContent = await readFile(apiPath, 'utf-8');
            return yamlLoad(apiContent) as OpenAPIV3;
        } catch (err) {
            console.error(`Unable to load API file from ${apiPath}`);
            console.error(err);
            return Promise.reject(err);
        }
    }
}