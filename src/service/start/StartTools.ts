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
import _ from "lodash";
import stream from "stream";

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

    this.app.use(async (err: any, req: any, res: any, next: any) => {
        console.log(err);
        // format error
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        });
    });

    if (!ctx.MethodDelegate) {
        return Promise.reject('No method delegates found');
    }

    for (const [apiPath, item] of Object.entries(bootstrap.api.paths)) {
        const formattedPath = apiPath.replace(/\{(.+?)\}/g, ':$1');
        const opPath = `${basePath}${formattedPath}`;
        for (const method of ['get', 'post', 'put', 'delete', 'patch', 'options'].filter(m => _.has(item, m))) {

            const apiConfig = _.get(item, method);
            const middleware: any[] = [];
            // if (apiConfig.security) {
            //     middleware.push(passport.authenticate('jwt', { session: false }));
            // }
            // const multipart = apiConfig.requestBody?.content['multipart/form-data'];
            // if (multipart) {
            //     const uploadFields = [];
            //     for (const [propName, propSpec] of Object.entries((multipart.schema as OpenAPIV3.SchemaObject).properties)) {
            //         if ((propSpec as OpenAPIV3.SchemaObject).type === 'array'
            //             && ((propSpec as OpenAPIV3.ArraySchemaObject).items as OpenAPIV3.SchemaObject).format === 'binary') {
            //             uploadFields.push({ name: propName, maxCount: 10 });
            //         }
            //         if ((propSpec as OpenAPIV3.SchemaObject).type === 'string'
            //             && (propSpec as OpenAPIV3.SchemaObject).format === 'binary') {
            //             uploadFields.push({ name: propName, maxCount: 1 });
            //         }
            //     }
            //     middleware.push(upload.fields(uploadFields));
            // }
            this.expressRequest(method, opPath, middleware, async (aReq: any, aRes: any) => {
                const methodDelegate = Object.values(ctx.MethodDelegate).find(d => d.config.path === apiPath && d.config.method === method)
                if (!methodDelegate) {
                    aRes.status(501).send('Method not yet implemented');
                    return;
                }
                try {
                    const params: any = { ...aReq };

                    if (methodDelegate.transactional) {
                        this.context.persistence.beginTransaction();
                    }
                    for (const delegate of methodDelegate.pipe) {
                        await delegate.process(this.context, params);
                    }
                    if (methodDelegate.transactional) {
                        this.context.persistence.commitTransaction();
                    }
                    if (methodDelegate.returnVar) {
                        const responseSpec = apiConfig.responses[200]?.content;
                        if (responseSpec) {
                            const [contentType, contentSchema] = Object.entries(responseSpec)[0];
                            if ((contentSchema as any).schema.type === 'string'
                                && (contentSchema as any).schema.format === 'binary') {
                                const dl: Buffer = params[methodDelegate.returnVar];
                                aRes.status(200);
                                aRes.set({
                                    'Cache-Control': 'no-cache',
                                    'Content-Type': contentType,
                                    'Content-Length': dl.byteLength,
                                    'Content-Disposition': 'attachment; filename=' + methodDelegate.returnVar
                                });
                                const bufferStream = new stream.PassThrough();
                                bufferStream.end(dl);
                                bufferStream.pipe(aRes);
                            } else {
                                aRes.status(200).send(params[methodDelegate.returnVar]);
                            }
                        } else {
                            aRes.status(200).send(params[methodDelegate.returnVar]);
                        }
                    } else {
                        aRes.status(200).send();
                    }
                } catch (err) {
                    if (methodDelegate.transactional) {
                        this.context.persistence.rollbackTransaction();
                    }
                    console.error(err);
                    if (err.responseCode) {
                        aRes.status(err.responseCode).send(err.responseMessage);
                    } else {
                        aRes.status(500).send(err);
                    }
                }

            });
        }
    }

    // start the express server
    this.app.listen(port, host, () => {
        // tslint:disable-next-line:no-console
        console.log(`server started at http://${host}:${port}`);
    });
}

async function loadConfigurations(basePath: string): Promise<Context> {
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


async function* getConfigFiles(dir: string): AsyncIterableIterator<string> {
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
