import { Config } from "@chillapi/api";
import { ContextLoader } from "./ContextLoader";

export class NoOpContextLoader implements ContextLoader<Config, any> {

    matches(configFile: Config): boolean {
        return false;
    }

    async load(configFile: Config): Promise<any> {
        console.warn(`No Op context loader used for config of kind: ${configFile.kind}`);
        return Promise.resolve(null);
    }

}