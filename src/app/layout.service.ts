import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  constructor() { }

  mobile() {
    return window.innerWidth <= 600;
  }

  desktop() {
    return window.innerWidth > 600;
  }
}
