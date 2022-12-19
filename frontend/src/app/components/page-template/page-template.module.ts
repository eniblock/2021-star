import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PageTemplateComponent} from './page-template.component';
import {AppRoutingModule} from 'src/app/app-routing.module';
import {MatDividerModule} from '@angular/material/divider';
import {MenuComponent} from './menu/menu.component';
import {HeaderComponent} from './header/header.component';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  imports: [CommonModule, AppRoutingModule, MatDividerModule, MatButtonModule, MatTooltipModule],
  declarations: [PageTemplateComponent, MenuComponent, HeaderComponent],
  exports: [PageTemplateComponent],
})
export class PageTemplateModule {
}
