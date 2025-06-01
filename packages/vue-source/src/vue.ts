import { DEBUG_SOURCE } from '@open-editor/shared';

export default {
  install(app: any) {
    if (process.env.NODE_ENV === 'development') {
      app.mixin({
        props: {
          [DEBUG_SOURCE]: String,
        },
      });
    }
  },
};
