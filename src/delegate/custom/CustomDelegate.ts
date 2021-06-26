import { Delegate } from '@chillapi/api';
import { CustomConfig } from "./CustomConfig";

export class CustomDelegate implements Delegate {

    constructor(private config: CustomConfig) { }

    async process(context: any, params: any): Promise<void> {
        const custom = require(this.config.path);
        try {
            await custom(context, params);
            Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
    }


}