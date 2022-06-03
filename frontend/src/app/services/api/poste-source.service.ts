import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {environment} from 'src/environments/environment';
import {Instance} from '../../models/enum/Instance.enum';
import {CacheService} from '../common/cache.service';
import {map} from "rxjs/operators";
import {Producer} from "../../models/Producer";
import {YellowPage} from "../../models/YellowPage";

@Injectable({
  providedIn: 'root',
})
export class PosteSourceService {
  private readonly CACHE_KEY = 'posteSourceCodes';
  private readonly CACHE_LIFETIME = 24 * 3600 * 1000; // In milliseconds

  constructor(
    private httpClient: HttpClient,
    private cacheService: CacheService
  ) {
  }

  getPosteSourceCodes(): Observable<string[]> {
    let req = this.httpClient.get<YellowPage[]>(`${environment.serverUrl}/yellow-pages`)
      .pipe(
        map(yellowPages => yellowPages
          .map(p => p.originAutomationRegisteredResourceMrid)
          .filter((item, pos, self) => self.indexOf(item) == pos)
          .sort()
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
