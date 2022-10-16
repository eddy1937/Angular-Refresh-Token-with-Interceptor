import { HttpErrorResponse } from "@angular/common/http";
import { catchError, concat, ignoreElements, Observable, take, tap, throwError } from "rxjs";
import { ACCESS_TOKEN, REFRESH_TOKEN, Token } from "./uitls";

function catchHttpError(status: number) {
  return (next: (err: HttpErrorResponse) => Observable<any>) => {
    return catchError((err) => err.status === status ? next(err) : throwError(() => err));
  };
}


export function setTokenToLocalStorage<T extends Token>() {
  return tap<T>(({ accessToken, refreshToken }) => {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(REFRESH_TOKEN, refreshToken);
  });
}

export function startWhen<T>(subscriptionDelay: Observable<any>) {
  return (source$: Observable<T>) => concat(subscriptionDelay.pipe(take(1), ignoreElements()), source$);
}

export const catch401Error = catchHttpError(401);
export const catch400Error = catchHttpError(400);
export const catch404Error = catchHttpError(404);
export const catch500Error = catchHttpError(500);
