import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from './badge/badge.component';
import { IconTechnologyTypeComponent } from './icon-technology-type/icon-technology-type.component';
<<<<<<< HEAD
import { UploaderFichierComponent } from './uploader-fichier/uploader-fichier.component';
import { NgxFileDropModule } from 'ngx-file-drop';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, NgxFileDropModule, MatButtonModule],
  declarations: [
    BadgeComponent,
    IconTechnologyTypeComponent,
    UploaderFichierComponent,
  ],
  exports: [
    BadgeComponent,
    IconTechnologyTypeComponent,
    UploaderFichierComponent,
  ],
=======

@NgModule({
  imports: [CommonModule],
  declarations: [BadgeComponent, IconTechnologyTypeComponent],
  exports: [BadgeComponent, IconTechnologyTypeComponent],
>>>>>>> develop
})
export class MicroComponentsModule {}
