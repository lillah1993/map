import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { delay, first, switchMap } from 'rxjs/operators';

import { MapService } from '../../map.service';
import { PlayerService } from '../../player.service';

import * as mapboxgl from 'mapbox-gl';
import { WawbService } from './wawb.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-wawb',
  templateUrl: './wawb.component.html',
  styleUrls: ['./wawb.component.less']
})
export class WawbComponent implements OnInit {
  
  @ViewChild('mapEl', {static: true}) mapEl: ElementRef;

  theMap: mapboxgl.Map;
  samples = new ReplaySubject<GeoJSON.FeatureCollection>(1);
  _sample = null;
  info = false;

  // LAYER_NAME = 'above-below-sample';
  LAYER_NAME = 'place-label';
  HIGHLIGHTS = 'highlighted';
  SOURCE_NAME = 'samples';
  DUMMY = {author: '', author_credits: ''}

  constructor(private api: WawbService, private map: MapService, private player: PlayerService, private activatedRoute: ActivatedRoute) {
    api.getSamples().pipe(
      switchMap((samples) => {
        this.samples.next(samples);
        return this.activatedRoute.fragment;
      }),
      first(),
      delay(100),
    ).subscribe((fragment) => {
      this.samples.pipe(first()).subscribe((samples) => {
        samples.features.forEach((s: any) => {
          const props = s.properties;
          if (props.id === fragment) {
            this.sample = props;
          }
        })
      });
    });
  }

  set sample(value) {
    this._sample = value;
    if (value) {
      this.setHighlight(value.id);
      location.hash = '#' + value.id;
    } else {
      this.setHighlight('__non_existent__');
      location.hash = '';
    }
  }

  get sample() {
    return this._sample;
  }

  ngOnInit(): void {
    this.theMap = new mapboxgl.Map({
      container: this.mapEl.nativeElement,
      // style: 'mapbox://styles/atlasmedliq/ckioczj9i39w717peyp20en12',
      style: 'mapbox://styles/ahmedlillah/cl1ezgsw6004815tdtizrks9m',
      minZoom: 3,
      bounds: [34.2654333839, 29.5013261988, 35.8363969256, 33.2774264593]
    });
    this.theMap.on('style.load', () => {
      this.samples.pipe(first()).subscribe((samples: GeoJSON.FeatureCollection) => {
        this.theMap.addSource(this.SOURCE_NAME, {type: 'geojson', data: samples});
        this.map.setLayerSource(this.theMap, this.LAYER_NAME, this.SOURCE_NAME);
        // this.map.setLayerSource(this.theMap, this.HIGHLIGHTS, this.SOURCE_NAME);
        this.setHighlight('__non_existent__');
        this.theMap.on('mouseenter', this.LAYER_NAME, () => {
          this.theMap.getCanvas().style.cursor = 'pointer';
        });
        this.theMap.on('mouseleave', this.LAYER_NAME, () => {
          this.theMap.getCanvas().style.cursor = '';
        });
        this.theMap.on('click', this.LAYER_NAME, (e) => {
          this.sample = e.features[0].properties;
          this.info = false;
          location.hash = '#' + this.sample.id;
        });
      });
    });
  }

  setHighlight(id) {
    if (this.theMap) {
      this.theMap.setFilter(this.HIGHLIGHTS, [
        "match",
        ["get", "id"],
        [id],
        true,
        false
      ]);  
    }
  }
}
