import { defineBuildConfig } from 'unbuild';
import buildConfig from '../../build.config';

export default defineBuildConfig({
  ...buildConfig,
  entries: [
    { input: 'src/index' },
    { input: 'src/client' },
    { input: 'src/node' },
  ],
});
