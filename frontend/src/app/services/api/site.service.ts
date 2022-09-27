import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {CacheService} from '../common/cache.service';
import {Site} from "../../models/Site";

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
    if (environment.activeCache) {
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
