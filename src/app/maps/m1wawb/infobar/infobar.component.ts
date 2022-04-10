import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Component, OnInit } from '@angular/core';

import * as marked from 'marked';
import { WawbService } from '../wawb.service';
@Component({
  selector: 'app-wawb-infobar',
  templateUrl: './infobar.component.html',
  styleUrls: ['./infobar.component.less']
})
export class WawbInfobarComponent implements OnInit {

  @Output() close = new EventEmitter();

  marked = marked;

  constructor(public wawb: WawbService) { }

  ngOnInit(): void {
  }

}
