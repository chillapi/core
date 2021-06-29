import { OpenAPIV3 } from "@chillapi/api/dist/openapiv3";

export interface Bootstrap {
    api: OpenAPIV3;
    corsOrigin: string;
    basePath: string;
}