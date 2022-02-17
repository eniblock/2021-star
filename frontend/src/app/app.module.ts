import { PageTemplateModule } from './components/page-template/page-template.module';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppComponent } from './app.component';
import { keycloakInitializer } from './factories/keycloak-initializer';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServerErrorInterceptor } from './interceptors/serveur-error-interceptor';
import {
  DateAdapter,
  MatNativeDateModule,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { CustomDateAdapter } from './adapters/custom-date-adapter';

@NgModule({
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    KeycloakAngularModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    PageTemplateModule,
    MatNativeDateModule,
  ],
  declarations: [AppComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: keycloakInitializer,
      deps: [KeycloakService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: ServerErrorInterceptor,
    },
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: LOCALE_ID, useValue: 'fr' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
