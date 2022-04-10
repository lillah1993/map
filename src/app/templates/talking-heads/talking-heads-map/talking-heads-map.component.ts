import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';
import { first } from 'rxjs/operators';
import { ApiService } from 'src/app/api.service';
import { LayoutService } from 'src/app/layout.service';
import { MapService } from 'src/app/map.service';
import { TalkingHeadsService } from '../talking-heads-service';
import { FeatureCollection } from 'geojson';

@Component({
  selector: 'app-talking-heads-map',
  templateUrl: './talking-heads-map.component.html',
  styleUrls: ['./talking-heads-map.component.less']
})
export class TalkingHeadsMapComponent implements OnInit, AfterViewInit {

  @Input() id;
  @Input() airtableBase;
  @Input() mapStyle;
  @Input() title;
  @Input() subtitle;
  @Input() infobarTitle;
  @Input() infobarSubtitle;
  api: TalkingHeadsService;

  theMap: mapboxgl.Map;
  _info = false;
  currentTimestamp = '';
  loadedImages = [];

  @ViewChild('mapEl', {static: true}) mapEl: ElementRef;

  constructor(private map: MapService, private apiSvc: ApiService,
              private router: Router, private activatedRoute: ActivatedRoute,
              private layout :LayoutService) { }

  ngOnInit(): void {
    this._info = localStorage.getItem(this.id) !== 'opened';
    this.api = new TalkingHeadsService(this.apiSvc, this.airtableBase);
  }

  ngAfterViewInit() {
    this.theMap = new mapboxgl.Map({
      container: this.mapEl.nativeElement,
      style: this.mapStyle,
      minZoom: 3,
      logoPosition: this.layout.desktop() ? 'bottom-left' : 'top-left',
      attributionControl: false,
    });
    this.theMap.on('load', () => {
      this.theMap.setLayoutProperty('trouble-waters-points', 'visibility', 'visible');
      this.theMap.setLayoutProperty('trouble-waters-markers', 'visibility', 'visible');
      if (this.layout.mobile()) {
        this.theMap.setPadding({top: 20, left: 20, right: 20, bottom: 180});
      }
      this.initialize();
    });
    setTimeout(() => {
      this.theMap.resize();
    }, 2000);
  }

  get info() { return this._info; }
  set info(value) {
    this._info = value;
    localStorage.setItem(this.id, 'opened');
  }

  setPosition(segment?: any, timestamp?: any, offset?: number) {
    this.router.navigate([this.id], {
      queryParams: {segment, timestamp}
    });
  }

  initialize() {
    this.initializeMarkers();
    this.initializeMapView();
    this.initializeNavigation();
  }

  initializeNavigation() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.api.setPosition({
        segment: params.segment,
        timestamp: params.timestamp,
        offset: params.offset,
        who: params.who || 'router'
      });
    })
  }

  initializeMarkers() {
    const LAYER_NAME = 'trouble-waters-points';
    const MARKER_LAYER_NAME = 'trouble-waters-markers';
    const SOURCE_NAME: string = (this.theMap.getLayer(LAYER_NAME) as mapboxgl.CircleLayer).source as string;
    const SOURCE_LAYER_NAME: string = (this.theMap.getLayer(LAYER_NAME) as mapboxgl.CircleLayer)['sourceLayer'] as string;
    this.api.data.pipe(first()).subscribe((data) => {
      const markers: FeatureCollection = {
        type: 'FeatureCollection',
        features: []
      };
      this.theMap.querySourceFeatures(SOURCE_NAME, {sourceLayer: SOURCE_LAYER_NAME}).forEach((feature, i) => {
        feature.id = i+1
        markers.features.push(feature);
      });
      this.theMap.addSource(SOURCE_LAYER_NAME, {
        type: 'geojson', data: markers
      });
      this.map.setLayerSource(this.theMap, LAYER_NAME, SOURCE_LAYER_NAME);

      let hoveredStateId = null;
      this.theMap.on('mouseover', LAYER_NAME, (e) => {
        this.theMap.getCanvas().style.cursor = 'pointer';
        const features = this.theMap.queryRenderedFeatures(e.point);
        if (features.length > 0 && features[0].layer.id === LAYER_NAME) {
          const feature = features[0];
          if (hoveredStateId) {
            this.theMap.setFeatureState({source: SOURCE_LAYER_NAME, id: hoveredStateId}, {hover: false});
          }
          hoveredStateId = feature.id;
          const name = feature.properties.name;
          let timestampId = this.theMap.getFeatureState({source: SOURCE_LAYER_NAME, id: hoveredStateId}).timestamp;

          if (!timestampId) {
            data.forEach((segment) => {
              segment.audio_timestamps.forEach((timestamp) => {
                if (!timestampId && timestamp.filter && timestamp.filter.map(x => '' + x).indexOf('' + name) >= 0) {
                  timestampId = timestamp.id;
                  this.theMap.setFeatureState({source: SOURCE_LAYER_NAME, id: hoveredStateId}, {
                    timestamp: timestampId,
                    color: segment.interviewee.color
                  });
                }
              });
            });  
          }
    
          this.theMap.setFeatureState({source: SOURCE_LAYER_NAME, id: hoveredStateId}, {hover: true});
        }
      });      
      this.theMap.on('click', LAYER_NAME, (e) => {
        var features = this.theMap.queryRenderedFeatures(e.point);
        if (features.length > 0 && features[0].layer.id === LAYER_NAME) {
          const timestamp = this.theMap.getFeatureState({source: SOURCE_LAYER_NAME, id: features[0].id}).timestamp;
          this.setPosition(null, timestamp);
        }
      });
      this.theMap.on('mouseleave', LAYER_NAME, (e) => {
        this.theMap.getCanvas().style.cursor = '';
        if (hoveredStateId) {
          this.theMap.setFeatureState({source: SOURCE_LAYER_NAME, id: hoveredStateId}, {hover: false});
        }
        hoveredStateId = null;
      });
    })
  }

  initializeMapView() {
    this.api.position.subscribe((position) => {
      const segment = position.segment;
      const timestamp = position.timestamp;
      if (timestamp.id === this.currentTimestamp) {
        return;
      }
      this.currentTimestamp = timestamp.id;
      const flyTo = this.map.parseMapView(timestamp);
      if (flyTo) {
        if (this.layout.mobile()) {
          flyTo.zoom -= 1;
        }
        this.theMap.flyTo(flyTo);
      }

      const timestampFilter = timestamp.filter || [];
      const requiredImages = timestampFilter.map((f) => `${segment.name}_${f}`);
      this.loadedImages = this.loadedImages.filter((li) => {
        if (requiredImages.indexOf(li) < 0) {
          console.log('REMOVED', li);
          this.theMap.removeImage(li);
          return false;
        }
        return true;
      });
      this.loadedImages = requiredImages;
      const filter = [
        "all",
        [
          "match",
          ["to-string", ["get", "segment"]],
          segment.name || '__non_existent',
          true,
          false
        ],
        [
          "match",
          ["to-string", ["get", "name"]],
          timestampFilter.length ? timestampFilter : ['__non_existent'],
          true,
          false
        ]
      ];
      this.theMap.setFilter('trouble-waters-markers', filter);

      for (const l of this.api.ALL_LAYERS) {
        const show_layers = timestamp.show_layers || [];
        if (show_layers.indexOf(l) === -1) {
          this.theMap.setLayoutProperty(l, 'visibility', 'none');
        } else {
          this.theMap.setLayoutProperty(l, 'visibility', 'visible');
        }
      }
    });
  }

  imageLoaded(ri: string, ev: Event) {
    console.log('LOADED', ri);
    this.theMap.addImage(ri, ev.target as HTMLImageElement);
  }
}
