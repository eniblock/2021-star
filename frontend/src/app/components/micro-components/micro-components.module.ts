import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BadgeComponent} from './badge/badge.component';
import {IconTechnologyTypeComponent} from './icon-technology-type/icon-technology-type.component';
import {UploaderFichierComponent} from './uploader-fichier/uploader-fichier.component';
import {NgxFileDropModule} from 'ngx-file-drop';
import {MatButtonModule} from '@angular/material/button';
import {TarifStatusComponent} from './tarif-status/tarif-status.component';
import {MatChipsModule} from "@angular/material/chips";
import {PipesModule} from "../../pipes/pipes.module";

@NgModule({
  imports: [
    CommonModule,
    NgxFileDropModule,
    MatButtonModule,
    MatChipsModule,
    PipesModule
  ],
  declarations: [
    BadgeComponent,
    IconTechnologyTypeComponent,
    UploaderFichierComponent,
    TarifStatusComponent,
  ],
  exports: [
    BadgeComponent,
    IconTechnologyTypeComponent,
    UploaderFichierComponent,
    TarifStatusComponent,
  ],
})
export class MicroComponentsModule {
}
