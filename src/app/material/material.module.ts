import { NgModule } from '@angular/core';
import {
  MatToolbarModule,
  MatExpansionModule,
  MatIconModule,
  MatListModule,
  MatCardModule,
  MatTooltipModule,
  MatButtonModule,
} from '@angular/material';

@NgModule({
  exports: [
    MatToolbarModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatTooltipModule,
    MatButtonModule,
  ]
})
export class MaterialModule { }
