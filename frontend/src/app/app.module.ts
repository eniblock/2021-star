import {PageTemplateModule} from './components/page-template/page-template.module';
import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServerErrorInterceptor} from './interceptors/serveur-error-interceptor';
import {DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule,} from '@angular/material/core';
import {CustomDateAdapter} from './adapters/custom-date-adapter';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {KeycloakInterceptor} from "./interceptors/keycloak-interceptor";
import {FileSaverModule} from "ngx-filesaver";
import {IndeminityStatusPipe} from "./pipes/IndeminityStatus.pipe";
import {DatePipe} from "@angular/common";

@NgModule({
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    PageTemplateModule,
    MatNativeDateModule,
    MatProgressBarModule,
    FileSaverModule,
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, multi: true, useClass: ServerErrorInterceptor,
    },
    {provide: HTTP_INTERCEPTORS, multi: true, useClass: KeycloakInterceptor},
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'},
    {provide: LOCALE_ID, useValue: 'fr'},
    {provide: DateAdapter, useClass: CustomDateAdapter},
    IndeminityStatusPipe, // Need to inject in Service
    DatePipe, // Need to inject in Service
  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule {
}
