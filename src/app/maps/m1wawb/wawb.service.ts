import { Injectable } from '@angular/core';
import { first, map, switchMap } from 'rxjs/operators';
import { FeatureCollection, Feature, Geometry } from 'geojson';

import { ApiService } from '../../api.service';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WawbService {

  BASE = 'app4j8ReBz6mg40Al';

  authorRecords = new ReplaySubject<any>(1);
  TITLE = '';
  SUBTITLE = '';
  ABOUT = '';
  MIN_ZOOM = 0
  
  constructor(private api: ApiService) {
    this.getAuthors();
  }

  fetchSettings() {
    return this.api.airtableFetch(this.BASE, 'Settings', 'website').pipe(
      map((response: any) => {
        const ret = {};
        response.records.forEach((i) => {
          ret[i.fields.key] = i.fields.value;
        });
        return ret;
      })
    );
  }

  getSamples() {
    return this.fetchSettings().pipe(
      switchMap((settings: any) => {
        this.TITLE = settings.title || '';
        this.SUBTITLE = settings.subtitle || '';
        this.ABOUT = settings.about || '';
        this.MIN_ZOOM = parseInt(settings.min_zoom);
        return this.api.airtableFetch(this.BASE, 'Samples', 'website');
      }),
      map((response: any) => response.records.map((rec) => {
        return Object.assign(rec.fields, {id: rec.id});
      })),
      map((samples: any[]) => { 
        return {
          type: 'FeatureCollection',
          features: samples.map((sample) => {
            const coordinates = sample.coordinates.split(',').map((x) => parseFloat(x));
            sample.symbol = (
              (sample.audio_above && sample.audio_above.length) ? '' : 'no'
            ) + 'above+' + (
              (sample.audio_below && sample.audio_below.length) ? '' : 'no'
            ) + 'below';
            sample.image_above = sample.image_above ? sample.image_above[0].thumbnails.large.url: '';
            sample.image_below = sample.image_below ? sample.image_below[0].thumbnails.large.url: '';
            sample.audio_above = sample.audio_above ? sample.audio_above[0].url: '';
            sample.audio_below = sample.audio_below ? sample.audio_below[0].url: '';
            sample.author = sample.author ? sample.author.join(',') : '';
            sample.author_credits = sample.author_credits ? sample.author_credits.join(',') : '';
            return {
              type: 'Feature',
              properties: sample,
              geometry: {
                type: 'Point',
                coordinates: [coordinates[1], coordinates[0]]
              } as Geometry
            } as Feature;
          })
        } as FeatureCollection;
      })
    );
  }

  getAuthors() {
    return this.api.airtableFetch(this.BASE, 'Authors', 'website')
        .pipe(
          this.api.airtableToMapping(),
        ).subscribe((authorRecords) => {
          this.authorRecords.next(authorRecords);
        });
  }

}
