import https from "https";

export interface JWK {
    e: string;
    kid: string;
    n: string;
    alg: string;
    use: string;
}

export interface WellKnown {
    issuer: string;
    authorization_endpoint?: string;
    device_authorization_endpoint?: string;
    token_endpoint?: string;
    userinfo_endpoint?: string;
    revocation_endpoint?: string;
    jwks_uri: string;
    response_types_supported?: string[];
    subject_types_supported?: string[];
    id_token_signing_alg_values_supported?: string[];
    scopes_supported?: string[];
    token_endpoint_auth_methods_supported?: string[];
    claims_supported: string[];
    code_challenge_methods_supported?: string[];
    grant_types_supported: string[];
}

export async function discover(uri: string): Promise<WellKnown> {
    return new Promise((resolve, reject) =>
        https.get(uri, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(JSON.parse(data) as WellKnown);
            });

        }).on("error", (err) => {
            reject(err);
        }));
}

export async function getJWKs(uri: string): Promise<JWK[]> {
    return new Promise((resolve, reject) => https.get(uri, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            resolve(JSON.parse(data) as JWK[]);
        });

    }).on("error", (err) => {
        reject(err);
    }));
}
