import { readdir, readFile } from 'fs/promises';
import { resolve } from 'path';
import yaml from 'js-yaml';
import { contextLoaders } from './context-loader';
import { ContextLoader, NoOpContextLoader } from "./context-loader/ContextLoader";
import { Config } from '@chillapi/api';

const CONFIG_PATTERN = /\.(yml|yaml)$/;

export class ChillAPI {

    private components: { [kind: string]: { [id: string]: any } };

    public async initialize(basePath: string): Promise<void> {
        try {
            for await (const f of this.getConfigFiles(basePath)) {
                const configs: Config[] = yaml.loadAll(await readFile(f, { encoding: 'utf-8' }));
                for (const doc of configs.filter(cfg => !!cfg.kind)) {
                    const contextLoader: ContextLoader = contextLoaders.find(ctxl => ctxl.matches(doc)) || new NoOpContextLoader();
                    this.components[doc.kind][doc.id] = await contextLoader.load(doc);
                };
            }
        } catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve();
    }

    public getComponent(kind: string, id: string): any {
        return this.components[kind][id];
    }

    public getComponents(kind: string): any[] {
        return Object.values(this.components[kind]);
    }

    async *getConfigFiles(dir: string): AsyncIterableIterator<string> {
        const dirents = await readdir(dir, { withFileTypes: true });
        for (const dirent of dirents) {
            const res = resolve(dir, dirent.name);
            if (dirent.isDirectory()) {
                yield* this.getConfigFiles(res);
            } else {
                if (CONFIG_PATTERN.test(res)) {
                    yield res;
                }
            }
        }
    }
}