import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { getFromLocalStorage } from './helpers';
import { AuthInfoModel } from './auth-info.model';

export const LOGIN_STATE_KEY = 'authInfo';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _authInfoState: BehaviorSubject<AuthInfoModel> =
    new BehaviorSubject<AuthInfoModel>(
      localStorage.getItem(LOGIN_STATE_KEY)
        ? (JSON.parse(
            localStorage.getItem(LOGIN_STATE_KEY) as string
          ) as AuthInfoModel)
        : ({} as AuthInfoModel)
    );
  authInfoState$: Observable<AuthInfoModel> = this._authInfoState.pipe(
    shareReplay(1),
    distinctUntilChanged()
  );
  getAuthInfoSnap = (): AuthInfoModel =>
    this._authInfoState.value ?? { accessToken: 'token' };
}
