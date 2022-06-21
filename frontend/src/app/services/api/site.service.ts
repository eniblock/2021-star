import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {environment} from 'src/environments/environment';
import {Instance} from '../../models/enum/Instance.enum';
import {CacheService} from '../common/cache.service';
import {map} from "rxjs/operators";
import {Producer} from "../../models/Producer";
import {YellowPage} from "../../models/YellowPage";
import {Site} from "../../models/Site";
import {PaginationReponse} from "../../models/RequestForm";
import {RechercheReseauEntite} from "../../models/RechercheReseau";

@Injectable({
  providedIn: 'root',
})
export class SiteService {
  private readonly CACHE_KEY = 'sites';
  private readonly CACHE_LIFETIME = 24 * 3600 * 1000; // In milliseconds

  constructor(
    private httpClient: HttpClient,
    private cacheService: CacheService
  ) {
  }

  getSites(): Observable<Site[]> {
    let req = this.httpClient.get<Site[]>(`${environment.serverUrl}/site`);
    if (environment.production) {
      // We use a cache in Production
      return this.cacheService.getValueInCacheOrLoadIt<Site[]>(
        this.CACHE_KEY,
        this.CACHE_LIFETIME,
        req
      );
    } else {
      return req;
    }
  }
}
