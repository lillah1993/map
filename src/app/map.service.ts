import * as mapboxgl from 'mapbox-gl';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  // ACCESS_TOKEN = 'pk.eyJ1IjoiYXRsYXNtZWRsaXEiLCJhIjoiY2tpbXgzNW5qMHhhcjJ5cGtydHpkNnJqYyJ9.vfietFuvTA8S1vaGlm3CUQ';
  ACCESS_TOKEN = 'pk.eyJ1IjoiYWhtZWRsaWxsYWgiLCJhIjoiY2wxM2RiN3UyMGMycDNvcXVlMnk3NHdiNiJ9.sV5Rd7Lab6adbB2R8ZZpHA';

  constructor(private http: HttpClient) {
    (mapboxgl as any).accessToken = this.ACCESS_TOKEN;
    mapboxgl.setRTLTextPlugin(
      'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
      null,
      true // Lazy load the plugin
    );
  }


  setLayerSource(map, layerId, source) {
    const oldLayers = map.getStyle().layers;
    const layerIndex = oldLayers.findIndex(l => l.id === layerId);
    const layerDef = oldLayers[layerIndex];
    const before = oldLayers[layerIndex + 1] && oldLayers[layerIndex + 1].id;
    layerDef.source = source;
    if (layerDef['source-layer']) {
      delete layerDef['source-layer'];
    }
    map.removeLayer(layerId);
    map.addLayer(layerDef, before);
  }

  parseMapView(view: any): mapboxgl.FlyToOptions {
    if (!view.geo) {
      return;
    }
    const geoRe = /center:\s*\{\s*lon:\s*([-0-9.]+),\s*lat:\s*([-0-9.]+)\s*\},\s*zoom:\s*([-0-9.]+),\s*pitch:\s*([-0-9.]+),\s*bearing:\s*([-0-9.]+)/g;
    const parsed = geoRe.exec(view.geo);
    const options: mapboxgl.FlyToOptions = {
      center: {
        lon: parseFloat(parsed[1]),
        lat: parseFloat(parsed[2]),
      },
      zoom: parseFloat(parsed[3]),
      pitch: parseFloat(parsed[4]),
      bearing: parseFloat(parsed[5])
    }
    if (view.curve) {
      options.curve = view.curve;
    }
    if (view.speed) {
      options.speed = view.speed;
    }
    return options;
  }
}
