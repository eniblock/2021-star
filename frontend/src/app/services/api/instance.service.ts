import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Instance } from '../../models/enum/instance.enum';
import { CacheService } from '../common/cache.service';

@Injectable({
  providedIn: 'root',
})
export class InstanceService {
  private readonly CACHE_KEY = 'instance';
  private readonly CACHE_LIFETIME = 1 * 3600 * 1000; // In milliseconds

  constructor(
    private httpClient: HttpClient,
    private cacheService: CacheService
  ) {}

  get(): Observable<Instance> {
    return this.cacheService.getValueInCacheOrLoadIt<Instance>(
      this.CACHE_KEY,
      this.CACHE_LIFETIME,
      this.httpClient.get<Instance>(`${environment.serverUrl}/instance`)
    );
  }
}
