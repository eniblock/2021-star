import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTemplateComponent } from './page-template.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MatDividerModule } from '@angular/material/divider';
import { MenuComponent } from './menu/menu.component';
import { BoutonMenuComponent } from './menu/bouton-menu/bouton-menu.component';

@NgModule({
  imports: [CommonModule, AppRoutingModule, MatDividerModule],
  declarations: [PageTemplateComponent, MenuComponent, BoutonMenuComponent],
  exports: [PageTemplateComponent],
})
export class PageTemplateModule {}
