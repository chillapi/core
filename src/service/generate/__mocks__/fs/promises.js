const fs = jest.createMockFromModule('fs/promises');

const api = {
    openapi: '3.0.1',
    info: {
        title: 'title',
        version: '1.0'
    },
    paths: {
    },
    components: {
        schemas: {
            MyEntity: {
                properties: {
                    id: {
                        type: 'integer'
                    },
                    title: {
                        type: 'string'
                    }
                }
            }
        }
    }
}

const yaml = require('js-yaml');

fs.readFile = jest.fn().mockReturnValue(Promise.resolve(yaml.dump(api)));
fs.writeFile = jest.fn();
fs.__api = api;

module.exports = fs;