import { Config, MethodDelegate, MethodDelegateConfig, Delegate, DelegateConfig } from "@chillapi/api";
import { ContextLoader } from "./ContextLoader";

export class MethodDelegateContextLoader implements ContextLoader<MethodDelegateConfig,MethodDelegate> {
    matches(configFile: Config): boolean {
        return configFile.kind === 'MethodDelegate';
    }

    async load(configFile: MethodDelegateConfig): Promise<MethodDelegate> {
        const pipe: Delegate[] = configFile.pipe.map(delegateConfig => this.loadDelegate(delegateConfig));
        const methodDelegate: MethodDelegate = {
            pipe,
            config: configFile
        };
        return Promise.resolve(methodDelegate);

    }

    private loadDelegate(config: DelegateConfig): Delegate {
        const DelegateClass = require(config.module)[config.delegateClass || 'default'];
        return new DelegateClass(config);
    }

}