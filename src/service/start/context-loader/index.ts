import { ContextLoader } from "./ContextLoader";
import { MethodDelegateContextLoader } from "./MethodDelegateContextLoader";
import { ModuleContextLoader } from "./ModuleContextLoader";

export const contextLoaders: ContextLoader[] = [
    new ModuleContextLoader(),
    new MethodDelegateContextLoader()
]