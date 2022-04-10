import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerComponent } from 'src/app/player/player.component';

@Component({
  selector: 'app-spectours-content-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.less']
})
export class AudioComponent implements OnInit, OnChanges, AfterViewInit{

  @Input() item;
  @Input() active = false;
  @Output() mapView = new EventEmitter<any>();
  @ViewChild(PlayerComponent, {static: true}) player: PlayerComponent;
  sub: Subscription = null;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.update();
  }

  ngAfterViewInit(): void {
    this.update();
  }

  update() {
    if (this.player && this.player.player) {
      if (this.active) {
        this.player.player.play();
        if (this.sub === null) {
          if (this.item.audio_timestamps && this.item.audio_timestamps.length) {
            this.sub = this.player.player.hiResTimestamp.subscribe((timestamp) => {
              const timestamps = this.item.audio_timestamps.filter((at) => at.timestamp * 10 === timestamp);
              if (timestamps.length && timestamps[0].map_view && timestamps[0].map_view.length) {
                this.mapView.emit(timestamps[0].map_view[0]);
              }
            });
          }
        }
      } else {
        this.player.player.pause();
        if (this.sub !== null) {
          this.sub.unsubscribe();
          this.sub = null;
        }
      }  
    }
  }

}
