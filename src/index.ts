import yargs from 'yargs';
import 'module-alias/register';
import { generate } from './service/generate/GenerateTools';

// tslint:disable-next-line:no-unused-expression
yargs
    .command('start', 'Starts a ChillAPI environment', y =>
        y.alias('p', 'configPath')
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
            .example('$0 --config /path/to/my/config.yaml', 'Starts the ChillAPI backend for the provided configuration')
            .example('$0', 'Starts the ChillAPI backend, using a local file names config.yaml, or the default configuration'),
       async args => console.log("start")
    )
    .command('generate', 'Generates ChillAPI configuration stubs based on existing OpenAPI spec', y =>
        y.alias('a', 'apiPath')
            .nargs('a', 1)
            .describe('a', 'OpenAPI 3.0 API descriptor file (yaml)')
            .alias('p', 'targetPath')
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
            }
        }
    )
    .help('?')
    .alias('?', 'help')
    .showHelpOnFail(true)
    .demandCommand(1, '')
    .argv;


