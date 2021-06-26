import { Config } from "@chillapi/api";
import { ContextLoader } from "./ContextLoader";

export class BootstrapContextLoader implements ContextLoader {
    matches(configFile: Config): boolean {
        return configFile.kind === 'Bootstrap';
    }

    load(configFile: Config): Promise<void> {
        return Promise.resolve();
    }

}