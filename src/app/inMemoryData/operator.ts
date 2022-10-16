import { ResponseOptions, STATUS } from "angular-in-memory-web-api";
import { catchError, defer, identity, Observable, pipe, delayWhen } from "rxjs";
import { RequestInfos, verifyAccessToken, verifyRefreshToken } from "./uitls";

function verifyToken(verify$: Observable<any>): (s$: Observable<ResponseOptions>) => Observable<ResponseOptions> {
  return pipe(delayWhen(() => verify$), catchError(async () => ({ status: STATUS.UNAUTHORIZED })));
}

export function verifyAccess(info: RequestInfos){
  const { req: { headers }} = info;
  const token = headers.get('Authorization')?.slice(7);
  const verify$ = defer(async () => verifyAccessToken(token));
  return verifyToken(verify$);
}

export function verifyRefresh(info: RequestInfos){
  const { req: { body: token }} = info;
  const verify$ = defer(async () => verifyRefreshToken(token));
  return verifyToken(verify$);
}

export function nothing(){
  return identity;
}
