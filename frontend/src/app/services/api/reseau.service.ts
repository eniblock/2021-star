import { UrlService } from './../common/url.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  RechercheReseauForm,
  RechercheReseauResponse,
} from 'src/app/models/RechercheReseau';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReseauService {
  constructor(private httpClient: HttpClient, private urlService: UrlService) {}

  find(form: RechercheReseauForm): Observable<RechercheReseauResponse> {
    let urlParams = this.urlService.toUrlParams(form);
    console.log(urlParams);
    return this.httpClient.get<RechercheReseauResponse>(
      `${environment.serverUrl}/reseau?${urlParams}`
    );
  }
}
