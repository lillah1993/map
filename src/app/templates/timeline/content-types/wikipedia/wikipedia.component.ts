import { Component, Input, OnInit } from '@angular/core';
import * as marked from 'marked';
@Component({
  selector: 'app-spectours-content-wikipedia',
  templateUrl: './wikipedia.component.html',
  styleUrls: ['./wikipedia.component.less']
})
export class WikipediaComponent implements OnInit {

  @Input() item;
  marked = marked;

  constructor() { }

  ngOnInit(): void {
  }

}
