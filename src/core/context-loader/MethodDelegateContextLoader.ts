import { Config, MethodDelegate, MethodDelegateConfig, Delegate, DelegateConfig } from "@chillapi/api";
import { ContextLoader } from "./ContextLoader";

export class MethodDelegateContextLoader implements ContextLoader {
    matches(configFile: Config): boolean {
        return configFile.kind === 'MethodDelegate';
    }

    async load(configFile: Config): Promise<MethodDelegate> {
        const methodDelegateConfig: MethodDelegateConfig = configFile as MethodDelegateConfig;
        const pipe: Delegate[] = methodDelegateConfig.pipe.map(delegateConfig => this.loadDelegate(delegateConfig));
        const methodDelegate: MethodDelegate = {
            pipe,
            config: methodDelegateConfig
        };
        return Promise.resolve(methodDelegate);

    }

    private loadDelegate(config: DelegateConfig): Delegate {
        const DelegateClass = require(config.module)[config.delegateClass || 'default'];
        return new DelegateClass(config);
    }

}