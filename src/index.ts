import yargs from 'yargs';
import { generate } from './service/generate/GenerateTools';
import { start } from './service/start/StartTools';


// tslint:disable-next-line:no-unused-expression
yargs
    .command('start', 'Starts a ChillAPI environment', y =>
        y.alias('c', 'configPath')
            .nargs('c', 1)
            .describe('c', 'Root path of the configuration files, defaults to .chill-api')
            .default('c', '.chill-api')
            .alias('h', 'hostname')
            .nargs('h', 1)
            .describe('h', 'Hostname to bind the API server')
            .default('h', 'localhost')
            .alias('p', 'port')
            .nargs('p', 1)
            .describe('p', 'Port to bind the API server')
            .default('p', '9000')
            .example('$0 --configPath /path/to/my/config.yaml', 'Starts the ChillAPI backend for the provided configuration')
            .example('$0', 'Starts the ChillAPI backend, using the local .chill-api folder as base configuration path, or the default configuration'),
        async args => {
            try {
                await start(args.configPath, args.hostname, args.port);
            } catch (err) {
                console.error('Start failed');
                console.error(err);
            }
        }
    )
    .command('generate', 'Generates ChillAPI configuration stubs based on existing OpenAPI spec', y =>
        y.alias('a', 'apiPath')
            .nargs('a', 1)
            .describe('a', 'OpenAPI 3.0 API descriptor file (yaml)')
            .alias('t', 'rootPath')
            .nargs('t', 1)
            .describe('t', 'Root path for the Chill API configuration files')
            .default('t', '.chill-api')
            .alias('m', 'moduleName')
            .nargs('m', 1)
            .describe('m', 'Module to be used for stub generation; if not present, it will be detected among dependencies')
            .example('$0 --apiPath /path/to/my/openapi.yaml -t ./chillapi', 'Generates ChillAPI configuration for the provided API, in a folder called chillapi'),
        async args => {
            try {
                await generate(args.apiPath, args.rootPath, args.moduleName);
            } catch (err) {
                console.error('Config generation failed');
                console.error(err);
            }
        }
    )
    .help('?')
    .alias('?', 'help')
    .showHelpOnFail(true)
    .demandCommand(1, '')
    .argv;


