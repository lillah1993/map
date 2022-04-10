import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, fromEvent } from 'rxjs';
import { delay, filter, first, map, tap, throttleTime } from 'rxjs/operators';
import { ApiService } from '../api.service';

import * as marked from 'marked';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.less']
})
export class MainPageComponent implements OnInit, OnDestroy {

  BASE = 'appDMYuX35cQbc97I';

  MAPS = [];
  SETTINGS: any = {};

  marked = marked;
  active = -1;
  about = false;
  mobile = false;
  iobs: IntersectionObserver;
  touchStart: number;

  constructor(private api: ApiService, private el: ElementRef, public layout: LayoutService) {
    forkJoin([
      api.airtableFetch(this.BASE, 'Maps', 'website', null, ['key', 'title', 'description', 'state', 'path']).pipe(api.airtableToArray()),
      api.airtableFetch(this.BASE, 'Settings', 'website', null, ['key', 'value']).pipe(api.airtableToArray())
    ]).pipe(
      first(),
      map(([maps, settings]) => {
        maps.forEach((el) => {
          el.mobile = !!el.mobile;
        });
        this.MAPS = maps;
        const _settings = {};
        settings.forEach(({key, value}) => {
          _settings[key] = value;
        })
        this.SETTINGS = _settings;
        this.MAPS.filter((v) => v.mobile).forEach((v, i) => { v.idx = i; });
        this.MAPS.filter((v) => !v.mobile).forEach((v, i) => { v.idx = i; });
        console.log('MAPS', this.MAPS);
        console.log('SETTINGS', this.SETTINGS);
      }),
      delay(0),
      tap(() => {      
        this.initObserver();
      })
    ).subscribe(() => { console.log('INIT'); });

    this.mobile = this.layout.mobile();
    fromEvent(window, 'resize').subscribe(() => {
      this.mobile = this.layout.mobile();
    });
  }

  ngOnInit(): void {
  }

  scrollTo(idx) {
    const nel = (this.el.nativeElement as HTMLElement).querySelector(`.viewport .slide[data-index="${idx}"]`) as HTMLElement;
    if (nel) {
      nel.scrollIntoView({behavior: 'smooth'});
    }
  }

  initObserver() {
    const nel = (this.el.nativeElement as HTMLElement).querySelector('.viewport');
    this.iobs = new IntersectionObserver(
      (entries) => { this.intersection(entries); },
      {
        root: nel,
        threshold: 0.5,
      }
    );
    nel.querySelectorAll('.slide').forEach((slide) => {
      this.iobs.observe(slide);
    });
    nel.querySelectorAll('.map').forEach((el) => {
      fromEvent(el, 'wheel').pipe(
        tap(() => {
          // console.log('WHEEL!!');
        }),
        filter((ev: WheelEvent) => ev.deltaY !== 0),
        throttleTime(500),
        map((ev: WheelEvent) => {
          // console.log('WHEEL');
          return ev.deltaY / Math.abs(ev.deltaY);
        }),
      ).subscribe((dir) => {
        nel.scrollTo({top: nel.scrollTop + dir * window.innerHeight * 0.6, behavior: 'smooth'});
      });
    });
    nel.querySelectorAll('.map').forEach((el) => {
      fromEvent(el, 'touchstart').subscribe(
        (ev: TouchEvent) => {
          this.touchStart = ev.touches[0].clientY;
          fromEvent(ev.target, 'touchmove').pipe(
            filter((ev: TouchEvent) => Math.abs(ev.touches[0].clientY - this.touchStart) > 20),
            first(),
            map((ev: TouchEvent) => {
              const delta =  this.touchStart - ev.touches[0].clientY;
              return delta / Math.abs(delta);
            })
          ).subscribe((dir) => {
            nel.scrollTo({top: nel.scrollTop + dir * window.innerHeight * 0.6, behavior: 'smooth'});
          })
        }
      );
    });
  }

  ngOnDestroy() {
    if (this.iobs) {
      this.iobs.disconnect();
      this.iobs = null;
    }
  }

  intersection(entries: IntersectionObserverEntry[]) {
    const intersecting = entries.filter((x) => x.isIntersecting);
    if (intersecting.length) {
      this.active = parseInt(intersecting[0].target.getAttribute('data-index'));
      this.about = false;
    }
    // console.log('intersection', intersecting.length, this.active);
  }

  mapTransformDesktop(i) {
    const height = window.innerHeight;
    const width = window.innerWidth;
    const bottom = 256;
    const top = 72;
    const skip = 128;
    const map_height = 350;
    const map_width = 480;
    const padding = 50;
    const margin = 20;
    const skew = 0.7
    let indent = Math.min(
      (map_height / 2) * skew + padding,
      width / 2 - margin - map_width - (map_height / 2) * skew 
    );
    let move = 0;
    if (i > this.active) {
      move = bottom - (i - this.active - 1) * skip
    } else if (i == this.active) {
      move = height - map_height - top * 2;
    } else {
      move = height - top + (this.active - i - 1) * skip;
    }
    move = -move;
    return `translateY(${move}px)translateX(${indent}px)skew(35deg, 0deg)`;
  }

  mapTransformMobile(i) {
    const height = window.innerHeight;
    const nel = (this.el.nativeElement as HTMLElement).querySelector('.viewport');
    const subheading = nel.querySelector('.subheading').getBoundingClientRect();
    const abouts = Array.from(nel.querySelectorAll('.about.regular'))
        .map((el) => el.getBoundingClientRect())
        .map((r) => r.bottom);
    const mapHeight = nel.querySelector('.map').getBoundingClientRect().height;
    const bottom = Math.min(40, height - (subheading.bottom + mapHeight) - 10);
    const top = 32;
    const skip = 64;
    let move = 0;
    if (i > this.active) {
      move = bottom - (i - this.active - 1) * skip
    } else if (i == this.active) {
      move = height - Math.max(...abouts) - mapHeight - 10;
    } else {
      move = height - top + (this.active - i - 1) * skip;
    }
    move = -move;
    // move = 0;
    return `translateY(${move}px)skew(35deg, 0deg)`;
  }

  collaborations() {
    (this.el.nativeElement as HTMLElement).querySelector('.collaborations').scrollIntoView({block: 'start'});
  }

  aboutTitle() {
    (this.el.nativeElement as HTMLElement).querySelector('.about-title').scrollIntoView({block: 'start'});
  }
}
