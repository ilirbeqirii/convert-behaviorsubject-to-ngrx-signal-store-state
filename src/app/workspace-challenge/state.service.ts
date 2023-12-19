import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private readonly _clearAppState = new Subject<Date>();
  clearAppState$ = this._clearAppState.asObservable();

  clearAppState = () => this._clearAppState.next(new Date());
}
