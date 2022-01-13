import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SnackbarService } from '../services/common/snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(private snackbarService: SnackbarService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          // handle error
        }
        const messageErreur =
          error.error != undefined && error.error.message != undefined
            ? `Erreur : ${error.error.message}`
            : undefined;
        this.snackbarService.showErrorSnackbar(messageErreur);
        return throwError(error);
      })
    );
  }
}
