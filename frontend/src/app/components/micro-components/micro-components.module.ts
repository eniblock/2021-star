import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from './badge/badge.component';
import { IconTechnologyTypeComponent } from './icon-technology-type/icon-technology-type.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BadgeComponent, IconTechnologyTypeComponent],
  exports: [BadgeComponent, IconTechnologyTypeComponent],
})
export class MicroComponentsModule {}
