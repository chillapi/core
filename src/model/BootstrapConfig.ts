import { Config } from "@chillapi/api";

export interface BootstrapConfig extends Config {
    apiPath: string;
    corsOrigin?: string;
    basePath?: string;
}