import yargs from 'yargs';
import 'module-alias/register';

const argv = yargs
    .command('start', 'Starts a ChillAPI environment', y =>
        y.alias('c', 'configPath')
            .nargs('c', 1)
            .describe('c', 'Configuration file, defaults to .chill-api/config.yaml')
            .default('c', '.chill-api/config.yaml')
            .alias('h', 'hostname')
            .nargs('h', 1)
            .describe('h', 'Hostname to bind the API server')
            .default('h', 'localhost')
            .alias('p', 'port')
            .nargs('p', 1)
            .describe('p', 'Port to bind the API server')
            .default('p', '9000')
            .example('$0 --config /path/to/my/config.yaml', 'Starts the ChillAPI backend for the provided configuration')
            .example('$0', 'Starts the ChillAPI backend, using a local file names config.yaml, or the default configuration'),
        args => console.log("start")
    )
    .command('init', 'Initializes the ChillAPI environment in the current folder', y =>
        y.alias('a', 'apiPath')
            .nargs('a', 1)
            .describe('a', 'OpenAPI 3.0 API descriptor file (yaml)')
            .alias('p', 'privateKeyPassPhrase')
            .nargs('p', 1)
            .describe('p', 'Pass phrase to use for the security private key')
            .default('p', 'changeme')
            .example('$0 --api /path/to/my/openapi.yaml', 'Generates ChillAPI configuration for the provided API'),
        args => console.log("generate")
    )
    .command('update', 'Updates an existing ChillAPI environment', y =>
        y.alias('a', 'apiPath')
            .nargs('a', 1)
            .describe('a', 'OpenAPI 3.0 API descriptor file (yaml)')
            .alias('c', 'configPath')
            .nargs('c', 1)
            .describe('c', 'Configuration file, defaults to ./chill-api-config.yaml')
            .default('c', '.chill-api/config.yaml')
            .example('$0 --config /path/to/my/config.yaml', 'Updates the ChillAPI metadata using the provided path'),
        args => console.log("update")
    )
    .help('?')
    .alias('?', 'help')
    .showHelpOnFail(true)
    .demandCommand(1, '')
    .argv;


