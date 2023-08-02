import { defineBuildConfig } from 'unbuild';
import buildConfig from '../../build.config';

export default defineBuildConfig({
  ...buildConfig,
  externals: ['vite'],
});
