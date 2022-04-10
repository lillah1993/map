import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import * as dayjs from 'dayjs';
import { first } from 'rxjs/operators';
import { WawbService } from '../wawb.service';

@Component({
  selector: 'app-wawb-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.less']
})
export class WawbSidebarComponent implements OnChanges {

  @Input() item;
  @Output() close = new EventEmitter();
  
  authorExpanded = {};
  
  image_above_audio_placeholder = 'assets/img/wawb-placeholder-above-audio.png';
  image_below_audio_placeholder = 'assets/img/wawb-placeholder-below-audio.png';
  image_above_noaudio_placeholder = 'assets/img/wawb-placeholder-above-noaudio.png';
  image_below_noaudio_placeholder = 'assets/img/wawb-placeholder-below-noaudio.png';

  constructor(private api: WawbService) {
  }

  ngOnChanges(): void {
    this.api.authorRecords.pipe(first()).subscribe((authorRecords) => {
      const authors = this.item.author.split(',');
      const credits = this.item.author_credits.split(',');
      for (const i in authors) {
        authors[i] = Object.assign({}, authorRecords[authors[i]]);
        if (credits[i] && credits[i].length) {
          authors[i].credit = credits[i];
        } else {
          authors[i].credit = authors[i].dafault_credit;
        }
      }
      this.item.authors = authors;
    });  
  }

  get date() {
    return dayjs(this.item.date).format(('dddd, D MMMM YYYY, h:mm a'))
  }

}
