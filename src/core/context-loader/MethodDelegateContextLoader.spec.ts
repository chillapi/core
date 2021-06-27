import { MethodDelegate } from '@chillapi/api';
import { MethodDelegateContextLoader } from './MethodDelegateContextLoader';

describe('Builtin delegate loading tests', () => {
    const methodDelegateLoader = new MethodDelegateContextLoader();

    const cases: any[] = [
        [
            'Custom Delegate',
            () => jest.mock('a-path', () => (contextArg: any, paramArg: any) => paramArg.test = 'value', { virtual: true }),
            {
                kind: 'MethodDelegate',
                returnVar: 'noMatter',
                method: 'get',
                path: 'some/path',
                pipe: [{
                    module: '@chillapi/builtin/custom/CustomDelegate',
                    delegateClass: 'CustomDelegate',
                    path: 'a-path'
                }],
                transactional: false,
            },
            {},
            (params: any) => expect(params.test).toBe('value'),
            null
        ],
    ]

    beforeEach(() => {
        jest.resetModules();
    });

    test.each(cases)('loads %s', async (title, preReq, methodDelegateConfig, params, responseAssert, errorAssert) => {

        if (preReq) {
            preReq();
        }

        expect(methodDelegateLoader.matches(methodDelegateConfig)).toBeTruthy();

        const delegate: MethodDelegate = await methodDelegateLoader.load(methodDelegateConfig);

        expect(delegate).toBeTruthy();

        try {
            await delegate.pipe[0].process({}, params);
            if (responseAssert) {
                responseAssert(params);
            }
        } catch (err) {
            if (errorAssert) {
                errorAssert(err);
            }
        }
    });
});