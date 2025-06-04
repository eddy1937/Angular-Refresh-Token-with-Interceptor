import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, defer, EMPTY, iif, Observable, share, takeUntil, throwError, retry, tap, of } from 'rxjs';
import { AuthService } from './auth.service';
import { catch401Error } from './operator';
import { InterceptorSkipHeader } from './uitls';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpInterceptor implements HttpInterceptor {

  logoutUser$ = defer(() => (this.authService.logout(), EMPTY));
  refresh$ = defer(() => this.authService.refreshTokenFromServer()).pipe(catchError(() => this.logoutUser$), share());

  constructor(private authService: AuthService) { }

  private applyCredentials(request: HttpRequest<any>): HttpRequest<any> {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${this.authService.accessToken}` }
    });
  }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (InterceptorSkipHeader.checkHeader(request)) {
      const req = InterceptorSkipHeader.deleteHeader(request);
      return next.handle(req);
    }
    const nextHandle$ = defer(() => next.handle(this.applyCredentials(request)));
    return iif(() => this.authService.tokenIsEmpty, this.logoutUser$, nextHandle$).pipe(this.httpErrorsHandler());
  }

  private httpErrorsHandler() {
    return <T>(source$: Observable<T>) => source$.pipe(
      this.handle401Error(),
      this.handleOtherError(),
    );
  }

  private handleOtherError() {
    return <T>(source$: Observable<T>) => source$.pipe(
      catchError((err) => {
        console.log(err);
        return throwError(() => err);
      }),
    );
  }

  private handle401Error() {
    return <T>(source$: Observable<T>) => source$.pipe(
      this.retry401Error(2),
      catch401Error(() => this.logoutUser$),
    );
  }

  private retry401Error(times: number) {
    return <T>(source$: Observable<T>) => {
      let recordedToken = this.authService.accessToken;
      // 如果 accessToken 沒變則執行 refresh，否則跳過
      const refreshIfUnchanged$ = iif(() => recordedToken === this.authService.accessToken, this.refresh$, of(null));

      return source$.pipe(
        // 每次訂閱時重新記錄當前的 accessToken
        tap({ subscribe: () => recordedToken = this.authService.accessToken }),
        retry({
          delay: (err) => throwError(() => err).pipe(catch401Error(() => refreshIfUnchanged$.pipe(takeUntil(this.authService.logout$)))),
          count: times,
        }),
      );
    };
  }
}
