import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { workspaces } from './workspace.model';

export interface RequestOption {
  params?: HttpParams;
  fields?: string[];
  headers?: HttpHeaders;
  responseType?: any;
  reportProgress?: boolean;
  observe?: any;
  skipUIActionInterceptors?: boolean;
  cacheEnabled?: boolean;
  context?: HttpContext;
}

@Injectable({
  providedIn: 'root',
})
export class CRUDService {
  getAll<T extends object>(
    type: new () => T,
    props?: RequestOption
  ): Observable<T[]> {
    // return EMPTY;

    return of(workspaces as T[])
  }

  delete<T extends object>(
    type: new () => T,
    guid: string | null
  ): Observable<Object> {
    return of({guid});
  }

  setWorkspaceEndpoints(guid: string | undefined) {}
}
