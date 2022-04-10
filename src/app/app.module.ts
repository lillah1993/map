import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import * as Sentry from "@sentry/angular";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WawbComponent } from './maps/m1wawb/wawb.component'
import { WawbSidebarComponent } from './maps/m1wawb/sidebar/sidebar.component';
import { PlayerComponent } from './player/player.component';
import { WawbInfobarComponent } from './maps/m1wawb/infobar/infobar.component';
import { SpecToursComponent } from './maps/m2spectours/spectours.component';
import { PlaceholderComponent } from './templates/timeline/placeholder/placeholder.component';
import { ContentComponent } from './templates/timeline/content/content.component';
import { TwitterComponent } from './templates/timeline/content-types/twitter/twitter.component';
import { ImageComponent } from './templates/timeline/content-types/image/image.component';
import { InstagramComponent } from './templates/timeline/content-types/instagram/instagram.component';
import { WikipediaComponent } from './templates/timeline/content-types/wikipedia/wikipedia.component';
import { AudioComponent } from './templates/timeline/content-types/audio/audio.component';
import { VideoComponent } from './templates/timeline/content-types/video/video.component';
import { LayoutComponent } from './layout/layout.component';
import { TroubledwatersComponent } from './maps/m3troubledwaters/troubledwaters.component';
import { TroubledwatersTimelineComponent } from './templates/talking-heads/timeline/timeline.component';
import { TroubledwatersPlayerComponent } from './templates/talking-heads/player/player.component';
import { Router } from '@angular/router';
import { SpectoursInfobarComponent } from './templates/timeline/infobar/infobar.component';
import { InfobarComponent } from './templates/talking-heads/infobar/infobar.component';
import { MainPageComponent } from './main-page/main-page.component';
import { TimelineMapComponent } from './templates/timeline/timeline-map/timeline-map.component';
import { TalkingHeadsMapComponent } from './templates/talking-heads/talking-heads-map/talking-heads-map.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    WawbComponent,
    WawbSidebarComponent,
    WawbInfobarComponent,
    SpecToursComponent,
    PlaceholderComponent,
    ContentComponent,
    TwitterComponent,
    ImageComponent,
    InstagramComponent,
    WikipediaComponent,
    AudioComponent,
    VideoComponent,
    LayoutComponent,
    TroubledwatersComponent,
    TroubledwatersTimelineComponent,
    TroubledwatersPlayerComponent,
    SpectoursInfobarComponent,
    InfobarComponent,
    MainPageComponent,
    TimelineMapComponent,
    TalkingHeadsMapComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true,
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
