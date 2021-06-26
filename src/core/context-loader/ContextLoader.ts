import { Config } from "@chillapi/api";

export interface ContextLoader {
    matches(configFile: Config): boolean;
    load(configFile: Config): Promise<any>
}

export class NoOpContextLoader implements ContextLoader {

    matches(configFile: Config): boolean {
        return false;
    }

    async load(configFile: Config): Promise<any> {
        console.warn(`No Op context loader used for config of kind: ${configFile.kind}`);
        return Promise.resolve(null);
    }

}