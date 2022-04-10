import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TalkingHeadsService } from '../talking-heads-service';

import * as marked from 'marked';

@Component({
  selector: 'app-troubledwaters-infobar',
  templateUrl: './infobar.component.html',
  styleUrls: ['./infobar.component.less']
})
export class InfobarComponent implements OnInit {

  @Input() api: TalkingHeadsService;
  @Input() title: string;
  @Input() subtitle: string;
  @Output() close = new EventEmitter();

  marked = marked;

  constructor() { }

  ngOnInit(): void {
  }

}
