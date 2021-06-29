import { Config } from "@chillapi/api";
import { BootstrapContextLoader } from "./BootstrapContextLoader";
import { ContextLoader } from "./ContextLoader";
import { MethodDelegateContextLoader } from "./MethodDelegateContextLoader";
import { ModuleContextLoader } from "./ModuleContextLoader";

export const contextLoaders: ContextLoader<Config, any>[] = [
    new ModuleContextLoader(),
    new BootstrapContextLoader(),
    new MethodDelegateContextLoader()
]