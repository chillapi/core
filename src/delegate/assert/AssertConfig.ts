import { DelegateConfig } from '@chillapi/api';

export interface AssertConfig extends DelegateConfig {
    truthyParam: string;
    failResponseCode: number;
    failResponseMessage: string;
}