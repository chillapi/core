// jest.config.ts
import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
    verbose: true,
    // transformIgnorePatterns: [
    //     "node_modules/(?!@chillapi)"
    // ],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'd.ts', 'tsx', 'json', 'node']
};
export default config;