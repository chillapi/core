import { Delegate } from '@chillapi/api';
import _ from 'lodash';
import { AssertConfig } from "./AssertConfig";

export class AssertDelegate implements Delegate {

    constructor(private config: AssertConfig) { }

    async process(context: any, params: any): Promise<void> {
        if (!_.get(params, this.config.truthyParam)) {
            return Promise.reject({ responseCode: this.config.failResponseCode, message: this.config.failResponseMessage });
        }
        return Promise.resolve();
    }
}