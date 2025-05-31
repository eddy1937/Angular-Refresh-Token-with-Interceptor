import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, defer, EMPTY, iif, Observable, share, takeUntil, throwError, retry } from 'rxjs';
import { AuthService } from './auth.service';
import { catch401Error, startWhen } from './operator';
import { InterceptorSkipHeader } from './uitls';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpInterceptor implements HttpInterceptor  {

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

  httpErrorsHandler() {
    return (source$: Observable<any>) => source$.pipe(
      // catch401Error(() => this.handle401Error(source$)),
      this.catch401Error(1),
    );
  }

  catch401Error(refreshTimes: number) {
    const refresh$ = this.refresh$.pipe(takeUntil(this.authService.logout$));
    return (source$: Observable<any>) => source$.pipe(
      retry({
        delay: (err, count) => {
          // if (count > refreshTimes || err.status !== 401) {
          //   return throwError(() => err);
          // }
          // return this.refresh$.pipe(takeUntil(this.authService.logout$));
          const error$ = throwError(() => err);
          return error$.pipe(catch401Error(() => count > refreshTimes ? error$ : refresh$));
        }
      }),
      catch401Error(() => this.logoutUser$),
    );
  }

  handle401Error(retry$: Observable<any>): Observable<any> {
    return retry$.pipe(
      startWhen(this.refresh$),
      takeUntil(this.authService.logout$),
      catch401Error(() => this.logoutUser$),
    );
  }
}
