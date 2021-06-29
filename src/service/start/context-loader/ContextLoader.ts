import { Config } from "@chillapi/api";

export interface ContextLoader {
    matches(configFile: Config): boolean;
    load(configFile: Config): Promise<any>
}