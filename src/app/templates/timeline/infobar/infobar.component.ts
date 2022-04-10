import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import * as marked from 'marked'
import { DomSanitizer } from '@angular/platform-browser';
import { first } from 'rxjs/operators';
import { TimelineMapService } from 'src/app/templates/timeline/timeline-map-service';

@Component({
  selector: 'app-spectours-infobar',
  templateUrl: './infobar.component.html',
  styleUrls: ['./infobar.component.less']
})
export class SpectoursInfobarComponent implements OnInit {

  @Input() title: string;
  @Input() subtitle: string;
  @Input() api: TimelineMapService;
  @Output() close = new EventEmitter();
  
  marked = marked;
  aboutContent: any = '';

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.api.ready.pipe(first()).subscribe(() => {
      this.aboutContent = this.sanitizer.bypassSecurityTrustHtml(marked(this.api.ABOUT))
    });
  }
}
