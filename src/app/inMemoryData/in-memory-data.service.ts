import { tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { InMemoryDbService, ResponseOptions, STATUS } from 'angular-in-memory-web-api';
import { Observable, of, pipe, switchMap, map } from 'rxjs';
import { APPLY_TOKEN, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, QUERY_USERINFO_BY_AUTH, REFRESH_TOKEN } from '../router';
import { nothing, verifyAccess, verifyRefresh } from './operator';
import { generateTokenData, RequestInfos } from './uitls';

const USER_INFO = { account: 'account', username: 'eddy' };

const router: { [key: string] : { option: ResponseOptions, verify: (info: RequestInfos) => (s$: Observable<ResponseOptions>) => Observable<ResponseOptions> } } = {
  [APPLY_TOKEN]: {
    option: { status: STATUS.OK, body: generateTokenData(USER_INFO)},
    verify: nothing
  },
  [REFRESH_TOKEN]: {
    option: { status: STATUS.OK, body: generateTokenData(USER_INFO)},
    verify: verifyRefresh
  },
  [OK]: {
    option: { status: STATUS.OK },
    verify: verifyAccess
  },
  [INTERNAL_SERVER_ERROR]: {
    option: { status: STATUS.INTERNAL_SERVER_ERROR },
    verify: verifyAccess
  },
  [NOT_FOUND]: {
    option: { status: STATUS.NOT_FOUND },
    verify: verifyAccess
  },
  [QUERY_USERINFO_BY_AUTH]: {
    option: { status: STATUS.OK, body: USER_INFO },
    verify: verifyAccess
  }
}

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {

  constructor() { }

  createDb(): {} {
    return {};
  }

  post(reqInfo: RequestInfos): Observable<any> {
    const { collectionName, utils: { createResponse$ }, url } = reqInfo;
    const { option, verify } = router[collectionName] ?? router[NOT_FOUND];
    return of(option).pipe(verify(reqInfo), switchMap((opt) => createResponse$(() => ({...opt, url}))));
  }
}
