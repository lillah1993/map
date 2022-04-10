import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { VisibilityDetector } from '../visibility-detector';

@Component({
  selector: 'app-spectours-timeline-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.less']
})
export class PlaceholderComponent implements OnInit, AfterViewInit {

  @Input() item;
  active = false;
  activeDetector = new VisibilityDetector();

  constructor(private el: ElementRef) {
    
  }

  ngOnInit(): void {
    this.activeDetector.detected.subscribe((value) => {
      this.active = value;
      if (value) {
        location.hash = '';
      }
    });
  }

  ngAfterViewInit() {
    const el: HTMLElement = this.el.nativeElement;
    this.activeDetector.initVisibilityDetector(el, el.parentElement, 'active');
  }

}
