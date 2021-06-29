import { Config } from "@chillapi/api";
import { readdir, readFile } from "fs/promises";
import { resolve } from "path"; import yaml from 'js-yaml';
import { contextLoaders } from './context-loader';
import { ContextLoader } from './context-loader/ContextLoader';
import { NoOpContextLoader } from "./context-loader/NoOpContextLoader";

const CONFIG_PATTERN = /\.(yml|yaml)$/;

export type Context = { [kind: string]: { [id: string]: ContextLoader } };

export async function start(basePath: string): Promise<void> {
    const ctx: Context = await loadConfigurations(basePath);
}

export async function loadConfigurations(basePath: string): Promise<Context> {
    const context: Context = {};
    try {
        for await (const f of getConfigFiles(basePath)) {
            const configs: Config[] = yaml.loadAll(await readFile(f, { encoding: 'utf-8' }));
            for (const doc of configs.filter(cfg => !!cfg.kind)) {
                const contextLoader: ContextLoader = contextLoaders.find(ctxl => ctxl.matches(doc)) || new NoOpContextLoader();
                if (!context[doc.kind]) {
                    context[doc.kind] = {};
                }
                context[doc.kind][doc.id] = await contextLoader.load(doc);
                console.log(`Loaded ${doc.kind} [${doc.id} from ${f}]`);
            };
        }
    } catch (err) {
        return Promise.reject(err);
    }
    return Promise.resolve(context);
}


export async function* getConfigFiles(dir: string): AsyncIterableIterator<string> {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getConfigFiles(res);
        } else {
            if (CONFIG_PATTERN.test(res)) {
                yield res;
            }
        }
    }
}