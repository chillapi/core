import { Config, ModuleConfig } from "@chillapi/api";
import { ContextLoader } from "./ContextLoader";

export class ModuleContextLoader implements ContextLoader<Config, any> {
    matches(configFile: Config): boolean {
        return configFile.kind === 'Module';
    }

    async load(configFile: Config): Promise<any> {
        const moduleConfig: ModuleConfig = configFile as ModuleConfig;
        try {
            const moduleLoader: any = require(moduleConfig.library)[moduleConfig.loaderClass || 'default'];
            await moduleLoader.loadModule(moduleConfig);
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
    }

}