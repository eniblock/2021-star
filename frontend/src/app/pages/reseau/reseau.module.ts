import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReseauComponent } from './reseau.component';
import { ReseauRoutes } from './reseau.routing';

@NgModule({
  imports: [CommonModule, ReseauRoutes],
  declarations: [ReseauComponent],
})
export class ReseauModule {}
