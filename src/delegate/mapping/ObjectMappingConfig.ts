import { DelegateConfig } from '@chillapi/api';

export interface FieldMapping {
    from: string;
    to: string;
}

export interface ObjectMappingConfig extends DelegateConfig {
    from: string;
    to: string;
    isArray: boolean;
    fields?: FieldMapping[];
    builtIn?: string;
}