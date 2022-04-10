import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import * as Sentry from "@sentry/angular";
import { Integrations } from "@sentry/tracing";

// Sentry.init({
//   dsn: "https://b52e3b3d246541c386f873870485bb2c@o367221.ingest.sentry.io/5584032",
//   autoSessionTracking: true,
//   integrations: [
//     new Integrations.BrowserTracing({
//       tracingOrigins: ["https://medliq.art"],
//       routingInstrumentation: Sentry.routingInstrumentation,
//     }),
//   ],

//   // We recommend adjusting this value in production, or using tracesSampler
//   // for finer control
//   tracesSampleRate: 1.0,
// });


if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
