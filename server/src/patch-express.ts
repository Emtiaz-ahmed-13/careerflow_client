import express from 'express';

/** NestJS reads `app.router`; Express 4.17+ installs a throwing getter. */
const originalDefaultConfiguration = express.application.defaultConfiguration;
express.application.defaultConfiguration = function patchedDefaultConfiguration(
  this: express.Application,
) {
  const originalDefineProperty = Object.defineProperty;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Object as any).defineProperty = function (obj: object, prop: PropertyKey, descriptor: PropertyDescriptor) {
    if (prop === 'router' && descriptor && typeof descriptor.get === 'function') {
      return originalDefineProperty.call(Object, obj, prop, {
        get() {
          (this as express.Application & { lazyrouter: () => void }).lazyrouter();
          return (this as express.Application & { _router: unknown })._router;
        },
        configurable: true,
      });
    }
    return originalDefineProperty.call(Object, obj, prop, descriptor);
  };

  try {
    originalDefaultConfiguration.call(this);
  } finally {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Object as any).defineProperty = originalDefineProperty;
  }
};
