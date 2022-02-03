import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from './badge/badge.component';
import { IconTechnologyTypeComponent } from './icon-technology-type/icon-technology-type.component';
import { UploaderFichierComponent } from './uploader-fichier/uploader-fichier.component';
import { NgxFileDropModule } from 'ngx-file-drop';

@NgModule({
  imports: [CommonModule, NgxFileDropModule],
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
})
export class MicroComponentsModule {}
