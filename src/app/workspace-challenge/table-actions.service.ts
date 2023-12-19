import { Injectable } from '@angular/core';
import { Observable, shareReplay, Subject } from 'rxjs';
import { TableName } from './table-name.enum';

@Injectable({
  providedIn: 'root',
})
export class TableActionsService {
  private _needUpdate = new Subject<TableName>();
  needsUpdate$: Observable<TableName> = this._needUpdate.pipe(shareReplay(1));

  constructor() {}

  triggerUpdate(tableName: TableName) {
    this._needUpdate.next(tableName);
  }
}
