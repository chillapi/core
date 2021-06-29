import { readdir, readFile } from "fs/promises";
import { resolve } from "path";
import yaml from 'js-yaml';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as  OpenApiValidator from 'express-openapi-validator';
import cors from 'cors';

import { Config } from "@chillapi/api";

import { contextLoaders } from './context-loader';
import { ContextLoader } from './context-loader/ContextLoader';
import { NoOpContextLoader } from "./context-loader/NoOpContextLoader";
import { Bootstrap } from "../../model/Bootstrap";


const CONFIG_PATTERN = /\.(yml|yaml)$/;

export type Context = { [kind: string]: { [id: string]: any } };

export async function start(basePath: string, host: string, port: number): Promise<void> {
    const ctx: Context = await loadConfigurations(basePath);

    console.log('Starting Express server');
    this.app = express();

    this.app.use(express.json())

    const bootstrap: Bootstrap = ctx.Bootstrap && Object.values(ctx.Bootstrap)[0] as Bootstrap;

    if (!bootstrap) {
        return Promise.reject("Missing bootstrap configuration file");
    }

    const corsOptions = { origin: bootstrap.corsOrigin };
    this.app.use(cors(corsOptions));
    this.app.options("*", cors(corsOptions));
    bootstrap.api.servers = [{ url: `${bootstrap.basePath}` }];
    this.app.use(`${bootstrap.basePath}/api-docs`, swaggerUi.serve, swaggerUi.setup(bootstrap.api));
    this.app.use(OpenApiValidator.middleware({
        apiSpec: bootstrap.api as any
    }));

    // start the express server
    this.app.listen(port, host, () => {
        // tslint:disable-next-line:no-console
        console.log(`server started at http://${host}:${port}`);
    });
}

export async function loadConfigurations(basePath: string): Promise<Context> {
    const context: Context = {};
    try {
        for await (const f of getConfigFiles(basePath)) {
            const configs: Config[] = yaml.loadAll(await readFile(f, { encoding: 'utf-8' }));
            for (const doc of configs.filter(cfg => !!cfg.kind)) {
                const contextLoader: ContextLoader<Config, any> = contextLoaders.find(ctxl => ctxl.matches(doc)) || new NoOpContextLoader();
                if (!context[doc.kind]) {
                    context[doc.kind] = {};
                }
                context[doc.kind][doc.id] = await contextLoader.load(doc);
                console.log(`Loaded ${doc.kind} [${doc.id}] from ${f}`);
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