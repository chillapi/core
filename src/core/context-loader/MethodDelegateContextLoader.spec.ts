import { MethodDelegate } from '@chillapi/api';
import { MethodDelegateContextLoader } from './MethodDelegateContextLoader';

describe('Builtin delegate loading tests', () => {
    const methodDelegateLoader = new MethodDelegateContextLoader();

    const cases: any[] = [
        [
            'Assert Delegate',
            null,
            {
                kind: 'MethodDelegate',
                returnVar: 'noMatter',
                method: 'get',
                path: 'some/path',
                pipe: [{
                    module: '@chillapi/builtin/assert/AssertDelegate',
                    delegateClass: 'AssertDelegate',
                    truthyParam: 'noParam',
                    failResponseCode: 400,
                    failResponseMessage: 'test failure'
                }],
                transactional: false,
            },
            {},
            null,
            (err: any) => expect(err).toEqual({ message: 'test failure', responseCode: 400 })
        ],
        [
            'Stub Delegate',
            null,
            {
                kind: 'MethodDelegate',
                returnVar: 'noMatter',
                method: 'get',
                path: 'some/path',
                pipe: [{
                    module: '@chillapi/builtin/stub/StubDelegate',
                    delegateClass: 'StubDelegate',
                    assign: 'stubVar',
                    payload: { some: 'payload' }
                }],
                transactional: false,
            },
            {},
            (params: any) => expect(params.stubVar).toEqual({ some: 'payload' }),
            null
        ],
        [
            'Mapping Delegate',
            null,
            {
                kind: 'MethodDelegate',
                returnVar: 'noMatter',
                method: 'get',
                path: 'some/path',
                pipe: [{
                    module: '@chillapi/builtin/mapping/MappingDelegate',
                    delegateClass: 'MappingDelegate',
                    from: 'aField',
                    to: 'anotherField',
                    isArray: false,
                    builtIn: 'snakeToCamel'
                }],
                transactional: false,
            },
            { 'aField': { 'some_property': 'value' } },
            (params: any) => expect(params.anotherField).toEqual({ 'someProperty': 'value' }),
            null
        ],
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