import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {CacheService} from '../common/cache.service';
import {SystemOperator} from "../../models/SystemOperator";

@Injectable({
  providedIn: 'root',
})
export class SystemOperatorService {
  private readonly CACHE_KEY = 'marketParticipant';
  private readonly CACHE_LIFETIME = 24 * 3600 * 1000; // In milliseconds

  constructor(
    private httpClient: HttpClient,
    private cacheService: CacheService
  ) {
  }

  getSystemOperators(): Observable<SystemOperator[]> {
    let req = this.httpClient.get<SystemOperator[]>(`${environment.serverUrl}/participant`)
    if (environment.production) {
      // We use a cache in Production
      return this.cacheService.getValueInCacheOrLoadIt<SystemOperator[]>(
        this.CACHE_KEY,
        this.CACHE_LIFETIME,
        req
      );
    } else {
      return req;
    }
  }
}
