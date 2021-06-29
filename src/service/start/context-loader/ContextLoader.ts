import { Config } from "@chillapi/api";

export interface ContextLoader<T extends Config,U> {
    matches(configFile: Config): boolean;
    load(configFile: T): Promise<U>
}