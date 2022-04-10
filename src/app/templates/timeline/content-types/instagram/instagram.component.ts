import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-spectours-content-instagram',
  templateUrl: './instagram.component.html',
  styleUrls: ['./instagram.component.less']
})
export class InstagramComponent implements OnInit {

  @Input() item;

  constructor() { }

  ngOnInit(): void {
  }

}
