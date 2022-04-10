import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-spectours-content-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.less']
})
export class ImageComponent implements OnInit {

  @Input() item;

  constructor() { }

  ngOnInit(): void {
  }

}
