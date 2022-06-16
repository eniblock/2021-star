import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {CacheService} from '../common/cache.service';
import {map} from "rxjs/operators";
import {Producer} from "../../models/Producer";
import {SortHelper} from "../../helpers/sort.helper";

@Injectable({
  providedIn: 'root',
})
export class ProducerService {
  private readonly CACHE_KEY = 'producerNames';
  private readonly CACHE_LIFETIME = 24 * 3600 * 1000; // In milliseconds

  constructor(
    private httpClient: HttpClient,
    private cacheService: CacheService
  ) {
  }

  getProducerNames(): Observable<string[]> {
    let req = this.httpClient.get<Producer[]>(`${environment.serverUrl}/producer`)
      .pipe(
        map(producers => producers
          .map(p => p.producerMarketParticipantName)
          .filter((item, pos, self) => self.indexOf(item) == pos)
          .sort(SortHelper.caseInsensitive)
        )
      );
    if (environment.production) {
      // We use a cache in Production
      return this.cacheService.getValueInCacheOrLoadIt<string[]>(
        this.CACHE_KEY,
        this.CACHE_LIFETIME,
        req
      );
    } else {
      return req;
    }
  }
}
