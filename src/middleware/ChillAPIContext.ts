// https://thebigredgeek.medium.com/request-context-with-typescript-and-express-4b5d6d903caa

import {
  Config,
  Context, Delegate,
  DelegateFactory,
  MethodDelegate,
  MethodDelegateConfig, ResponseContainer
} from '@chillapi/api';
import { Request } from 'express';
import { readdir, readFile } from 'fs/promises';
import * as yaml from 'js-yaml';
import { resolve } from 'path';


/**
 * Context holding ChillAPI plugin processing
 */
export class ChillAPIContext implements Context {
  static _bindings = new WeakMap<Request, ChillAPIContext>();

  static _delegates: MethodDelegate[] = [];

  private _response?: ResponseContainer = {
    code: 500,
    type: 'json',
    content: { error: 'Response was not set by ChillAPI middleware' },
  };

  private _vars: { [key: string]: any } = {}

  /**
   * The ResponseContainer holding the partial response
   */
  get response(): ResponseContainer {
    return this._response;
  }

  /**
   *  Setter for the ResponseContainer
   * @param {ResponseContainer} re provided value
   */
  set response(re: ResponseContainer) {
    this._response = re;
  }

  /**
   *  Retrieves a variable from the context
   * @param {string} key the key to search
   * @return {any} the value for the given key
   */
  getVar(key: string): any {
    return this._vars[key];
  }

  /**
   * Sets a value on the context
   * @param {string} key the variable key
   * @param {any} value the variable content
   */
  setVar(key: string, value: any): void {
    this._vars[key] = value;
  }


  /**
   * Binds a new Context to a request
   * @param {Request} req
   * @return {ChillAPIContext} the newly bound context
   */
  static bind(req: Request): ChillAPIContext {
    const ctx = new ChillAPIContext();
    ChillAPIContext._bindings.set(req, ctx);
    return ctx;
  }

  /**
   * Gets the Context associated with this request
   * @param {Request} req
   * @return {ChillAPIContext} The context associated with this request
   */
  static get(req: Request): ChillAPIContext | null {
    return ChillAPIContext._bindings.get(req) || null;
  }
  /**
   * Registers a new plugin based on a configuration
   * @param {string} configPath Configuration base path
   */
  static async configure(configPath: string): Promise<void> {
    const factories: { [key: string]: DelegateFactory } = {};
    for await (const factoryConfig of
      getConfigs(configPath, 'DelegateFactory')) {
      factories[factoryConfig.id] = require(factoryConfig.id)(factoryConfig);
    }
    for await (const methodConfig of getConfigs(configPath, 'MethodDelegate')) {
      const config = methodConfig as MethodDelegateConfig;
      ChillAPIContext._delegates.push({
        config,
        pipe: config.pipe.map((delegateConfig) => {
          const factory = factories[delegateConfig.delegate];
          if (!!factory) {
            return factory.createDelegate(delegateConfig);
          }
          throw new Error(`Unable to configure method ${methodConfig.id} 
          because of missing module ${delegateConfig.delegate}`);
        }),
      });
    }
  }

  /**
   * Finds a delegate for the given path and method
   * @param {Request} req An express request
   * @return {MethodDelegate|undefined} a configured method delegate
   */
  static getMethodDelegate(req: Request): MethodDelegate | undefined {
    return this._delegates.find(
        (d) => d.config.method === req.method && d.config.path === req.path);
  }
}

/**
 * ChillAPI Express middleware
 * @param {Request} req
 * @param {Response} res
 * @param {any} next
 */

export const ChillAPIMiddleware =
  (req: Request, res: any, next: any) => {
    const ctx = ChillAPIContext.bind(req);
    const methodDelegate = ChillAPIContext.getMethodDelegate(req);
    if (!!methodDelegate) {
      methodDelegate.pipe.forEach((delegate: Delegate) => delegate.process(ctx,
          { ...req.params, body: req.body }));
    }
    next();
  };

/**
 * Returns a generator supplying files in a dir
 * @param {string} dir Directory to iterate recursively
 * @param {string} type A type filter for configs
 */
async function* getConfigs(dir: string, type?: string): AsyncGenerator<Config> {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getConfigs(res);
    } else {
      try {
        const configContent: Config = yaml.load(
            (await readFile(res)).toString());
        if (configContent.id && (!type || type === configContent.kind)) {
          yield configContent;
        }
      } catch (err) {
        console.warn(`Read failed for config file ${res}`);
      }
    }
  }
}

