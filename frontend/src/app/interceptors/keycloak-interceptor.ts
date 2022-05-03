import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {mergeMap} from "rxjs/operators";
import {environment} from "src/environments/environment";
import {KeycloakService} from "../services/common/keycloak.service";

@Injectable({
  providedIn: 'root'
})
export class KeycloakInterceptor implements HttpInterceptor {

  constructor(
    private keycloakService: KeycloakService
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const callingStarApi = req.url.startsWith(environment.serverUrl);
    if (callingStarApi) { // Wa add the token
      return this.keycloakService.getToken(true)
        .pipe(
          mergeMap(token => {
            const authReq = req.clone({
              headers: req.headers.set('Authorization', 'bearer ' + token)
            });
            return next.handle(authReq);
          })
        );
    } else { // We don't modify the request
      return next.handle(req);
    }
  }

}
