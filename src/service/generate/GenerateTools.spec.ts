import { resolve } from 'path';

import { dump } from 'js-yaml';

import { generate } from './GenerateTools';

jest.mock('fs');
jest.mock('fs/promises');
jest.mock('test-module');

test('generates config files', async () => {
    const testModule = require('test-module');
    const fsPromises = require('fs/promises');
    await generate('/path/to/api', '/path/to/config', 'test-module');
    expect(testModule.generateStubs).toBeCalledWith(fsPromises.__api, '/path/to/config');
    expect(fsPromises.writeFile).toBeCalledWith(resolve('/path/to/config', 'main.yaml'), dump({ kind: 'Bootstrap', id: 'bootstrap/main', apiPath: '/path/to/api' }));
});