import { Config, ModuleConfig, ModuleLoader } from "@chillapi/api";
import { ContextLoader } from "./ContextLoader";

export class ModuleContextLoader implements ContextLoader {
    matches(configFile: Config): boolean {
        return configFile.kind === 'Module';
    }

    async load(configFile: Config): Promise<any> {
        const moduleConfig: ModuleConfig = configFile as ModuleConfig;
        const moduleLoader: ModuleLoader = require(moduleConfig.library)[moduleConfig.loaderClass || 'default'];
        return moduleLoader.loadModule(moduleConfig);
    }

}