import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { load as yamlLoad, dump } from 'js-yaml';

import { OpenAPIV3 } from '@chillapi/api/dist/openapiv3';
import { load } from '@chillapi/module-discovery';

import { BootstrapConfig } from '../../model/BootstrapConfig';


export async function generate(apiPath: string, rootPath: string, moduleName?: string): Promise<void> {
    try {
        const api = await loadApi(apiPath);
        const inferredModuleName = moduleName || await loadModule();
        console.info(`Using ${inferredModuleName} for stub generation`);
        await require(inferredModuleName).generateStubs(api, rootPath);
        await writeBaseConfig(apiPath, rootPath);
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

async function loadModule(): Promise<any> {
    console.info('Auto-disovering module to use for stub generation');
    const chillAPIModulesWithGenerate: any[] = await load('generateStubs');
    if (chillAPIModulesWithGenerate.length === 0) {
        return Promise.reject("No seed generator found within project dependencies. Try adding '@chillapi/stub' to your project.json.");
    }
    if (chillAPIModulesWithGenerate.length > 1) {
        return Promise.reject(`Multiple seed generators found: ${chillAPIModulesWithGenerate.join(';')}. Run the generate command with a specific module, or leave only one seed generator.`)
    }
    return Promise.resolve(chillAPIModulesWithGenerate[0]);
}

async function loadApi(apiPath: string): Promise<OpenAPIV3> {
    if (existsSync(apiPath)) {
        try {
            const apiContent = await readFile(apiPath, 'utf-8');
            return Promise.resolve(yamlLoad(apiContent) as OpenAPIV3);
        } catch (err) {
            console.error(`Unable to load API file from ${apiPath}`);
            console.error(err);
            return Promise.reject(err);
        }
    }
}

async function writeBaseConfig(apiPath: string, rootPath: string): Promise<void> {
    try {
        const baseConfig: BootstrapConfig = {
            kind: 'Bootstrap',
            id: 'bootstrap/main',
            apiPath
        }
        await writeFile(resolve(rootPath, 'main.yaml'), dump(baseConfig));
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}