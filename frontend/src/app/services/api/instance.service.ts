import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {environment} from 'src/environments/environment';
import {Instance} from '../../models/enum/Instance.enum';
import {CacheService} from '../common/cache.service';

@Injectable({
  providedIn: 'root',
})
export class InstanceService {
  private readonly CACHE_KEY_INSTANCE = 'instance';
  private readonly CACHE_LIFETIME_INSTANCE = 24 * 3600 * 1000; // In milliseconds

  private readonly CACHE_KEY_PARTICIPANT_NAME = 'participantName';
  private readonly CACHE_LIFETIME_PARTICIPANT_NAME = 24 * 3600 * 1000; // In milliseconds

  constructor(
    private httpClient: HttpClient,
    private cacheService: CacheService
  ) {
  }

  getTypeInstance(): Observable<Instance> {
    const req = this.httpClient.get<Instance>(`${environment.serverUrl}/instance`);
    if (environment.production) {
      // We use a cache in production
      return this.cacheService.getValueInCacheOrLoadIt<Instance>(
        this.CACHE_KEY_INSTANCE,
        this.CACHE_LIFETIME_INSTANCE,
        req
      );
    } else {
      return req;
    }
  }

  getParticipantName(): Observable<string> {
    const req: any = this.httpClient.get<string>(`${environment.serverUrl}/instance/participantName`, {responseType: 'text'} as any);
    if (environment.production) {
      // We use a cache in production
      return this.cacheService.getValueInCacheOrLoadIt<string>(
        this.CACHE_KEY_PARTICIPANT_NAME,
        this.CACHE_LIFETIME_PARTICIPANT_NAME,
        req
      );
    } else {
      return req;
    }
  }

}
