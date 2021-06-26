import { ModuleLoader, OpenAPIV3 } from '@chillapi/api';
import { load } from '@chillapi/module-discovery';

export class GenerateService {
    public async generate(api: OpenAPIV3, rootPath: string, moduleName?: string): Promise<void> {
        try {
            const module: ModuleLoader = moduleName ? require(moduleName) : this.loadModule();
            await module.generateStubs(api, rootPath);
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
    }

    private loadModule(): ModuleLoader {
        const chillAPIModulesWithGenerate: ModuleLoader[] = load('generateStubs');
        if (chillAPIModulesWithGenerate.length === 0) {
            throw new Error("No seed generator found within project dependencies. Try adding '@chillapi/stub' to your project.json.");
        }
        if (chillAPIModulesWithGenerate.length > 1) {
            throw new Error(`Multiple seed generators found: ${chillAPIModulesWithGenerate.join(';')}. Run the generate command with a specific module, or leave only one seed generator.`)
        }
        return chillAPIModulesWithGenerate[0];
    }
}



