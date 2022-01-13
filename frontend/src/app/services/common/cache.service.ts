import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor() {}

  getValueInCacheOrLoadIt<T>(
    cacheKey: string,
    lifetime: number,
    observableNewValues: Observable<T>
  ): Observable<T> {
    const valInCache = localStorage.getItem(cacheKey);
    const valInCacheParsed = valInCache == null ? null : JSON.parse(valInCache);
    if (
      valInCacheParsed == null ||
      Date.now() - valInCacheParsed.timestamp > lifetime
    ) {
      return observableNewValues.pipe(
        tap((vals) => {
          const cacheValue = JSON.stringify({
            value: vals,
            timestamp: Date.now(),
          });
          localStorage.setItem(cacheKey, cacheValue);
        })
      );
    } else {
      return of(valInCacheParsed.value);
    }
  }
}
