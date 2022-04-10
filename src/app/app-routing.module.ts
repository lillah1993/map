import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { WawbComponent } from './maps/m1wawb/wawb.component';
import { SpecToursComponent } from './maps/m2spectours/spectours.component';
import { TroubledwatersComponent } from './maps/m3troubledwaters/troubledwaters.component';

const routes: Routes = [
  {path: 'water-above-water-below', component: WawbComponent},
  {path: 'speculative-tourism-sea-change', component: SpecToursComponent},
  {path: 'troubled-waters-the-nile-conflict', component: TroubledwatersComponent},
  {path: '', component: MainPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
