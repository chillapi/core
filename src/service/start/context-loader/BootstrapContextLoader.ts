import { readFile } from "fs/promises";
import { load as yamlLoad } from 'js-yaml';

import { Config } from "@chillapi/api";

import { ContextLoader } from "./ContextLoader";
import { BootstrapConfig } from "../../../model/BootstrapConfig";
import { Bootstrap } from "../../../model/Bootstrap";


export class BootstrapContextLoader implements ContextLoader<BootstrapConfig, Bootstrap> {
    matches(configFile: Config): boolean {
        return configFile.kind === 'Bootstrap';
    }

    async load(configFile: BootstrapConfig): Promise<Bootstrap> {
        try {
            const doc = (await readFile(configFile.apiPath)).toString();
            return Promise.resolve({
                api: yamlLoad(doc),
                corsOrigin: configFile.corsOrigin || 'http://localhost:4200',
                basePath: configFile.basePath || ''
            });
        } catch (err) {
            return Promise.reject(err);
        }
    }

}