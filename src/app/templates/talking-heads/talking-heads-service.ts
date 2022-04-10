import { ReplaySubject, forkJoin } from "rxjs";
import { map, first, tap, switchMap } from "rxjs/operators";

import { ApiService } from '../../api.service';

export type Position = {segment: any, timestamp?: any, offset?: number};


export class TalkingHeadsService {
    data = new ReplaySubject<any[]>(1);
    position = new ReplaySubject<Position>(1);
    playing = false;
  
    TITLE = '';
    ABOUT = '';
  
    ALL_LAYERS = [];
  
    constructor(private api: ApiService, private baseId: string) {
      this.fetchData();
    }
  
    fetchSettings() {
      return this.api.airtableFetch(this.baseId, 'Settings', 'website').pipe(
        map((response: any) => {
          const ret = {};
          response.records.forEach((i) => {
            ret[i.fields.key] = i.fields.value;
          });
          return ret;
        })
      );
    }
  
    setPosition(options: {segment?: any, timestamp?: any, offset?: number, who?: string}) {
      let {segment, timestamp, offset, who} = options;
      this.data.pipe(
        first(),
        map((segments) => {
          if (!timestamp && !segment) {
            segment = segments[0];
          }
          if (timestamp && !timestamp.id) {
            segments.forEach((segment) => {
              if (segment.audio_timestamps) {
                segment.audio_timestamps.forEach((audio_timestamp) => {
                  if (audio_timestamp.id === timestamp) {
                    timestamp = audio_timestamp;
                  }
                })  
              }
            });
          }
          if (timestamp && !segment) {
            segment = timestamp.segment;
          }    
          if (segment && !segment.id) {
            segment = segments.filter(x => x.id === segment)[0];
          }
          if (segment && !timestamp && segment.audio_timestamps) {
            if (offset) {
              const before = segment.audio_timestamps.filter(x => x.timestamp <= offset);
              timestamp = before[before.length - 1];
            } else {
              timestamp = timestamp || segment.audio_timestamps[0];
            }
          }
          offset = offset || timestamp.timestamp;  
          return {segment, timestamp, offset, who};
        })
      ).subscribe(({segment, timestamp, offset, who}) => {
        this.position.next({segment, timestamp, offset})
      });
    }
  
    fetchSegments() {
      return this.api.airtableFetch(this.baseId, 'Segment', 'website', null, ['title', 'name', 'interviewee', 'audio_timestamps', 'audio', 'duration']).pipe(
        map((x: any) => x.records.map((x) => Object.assign(x.fields, {id: x.id})))
      );
    }
  
    fetchInterviewees() {
      return this.api.airtableFetch(this.baseId, 'Interviewees', 'website', null, ['name', 'title', 'bio', 'twitter_username', 'profile_pic', 'color']).pipe(
        this.api.airtableToMapping()
      );
    }
  
    fetchAudioTimestamps() {
      return this.api.airtableFetch(this.baseId, 'AudioTimestamps', 'website', null, ['name', 'timestamp', 'coordinates', 'geo', 'speed', 'curve', 'filter', 'segment', 'show_layers']).pipe(
        tap((resp: any) => {
          resp.records.map((rec) => {
            if (rec.fields.coordinates) {
              rec.fields.coordinates = rec.fields.coordinates.split(',').map(parseFloat);
            }
            rec.fields.timestamp *= 10;
            if (rec.fields.segment && rec.fields.segment.length) {
              rec.fields.segment = rec.fields.segment[0];
            }
            if (rec.fields.show_layers) {
              for (const l of rec.fields.show_layers) {
                if (this.ALL_LAYERS.indexOf(l) === -1) {
                  this.ALL_LAYERS.push(l);
                }
              }  
            }
            return rec;  
          });
        }),
        this.api.airtableToMapping()
      );
    }
  
    fetchData() {
      return this.fetchSettings().pipe(
        switchMap((settings: any) => {
          this.TITLE = settings.title;
          this.ABOUT = settings.about;
          return forkJoin([
            this.fetchSegments(),
            this.fetchAudioTimestamps(),
            this.fetchInterviewees(),
          ]);
        }),
        map(([segments, audio_timestamps, interviewees]) => {
          for (const segment of segments) {
            segment.audio = segment.audio[0].url;
            segment.audio_timestamps = segment.audio_timestamps ? segment.audio_timestamps.map((x) => audio_timestamps[x]) : [{
              id: segment.id + '-dummy', timestamp: 0
            }];
            (segment.audio_timestamps as any[]).sort((a ,b) => a.timestamp - b.timestamp);
            segment.interviewee = segment.interviewee && segment.interviewee.length ? interviewees[segment.interviewee[0]] : null;
          }
          return segments;
        })
      ).subscribe((data) => {
        this.data.next(data);
      })
    }
  
}