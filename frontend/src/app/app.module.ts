import {PageTemplateModule} from './components/page-template/page-template.module';
import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServerErrorInterceptor} from './interceptors/serveur-error-interceptor';
import {
  DateAdapter,
  MatNativeDateModule,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {CustomDateAdapter} from './adapters/custom-date-adapter';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {KeycloakInterceptor} from "./interceptors/keycloak-interceptor";

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
  ],
  declarations: [AppComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, multi: true, useClass: ServerErrorInterceptor,
    },
    {provide: HTTP_INTERCEPTORS, multi: true, useClass: KeycloakInterceptor},
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'},
    {provide: LOCALE_ID, useValue: 'fr'},
    {provide: DateAdapter, useClass: CustomDateAdapter},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
