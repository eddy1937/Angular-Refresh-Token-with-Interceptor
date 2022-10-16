import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, defer, EMPTY, iif, Observable, share, takeUntil } from 'rxjs';
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
      catch401Error(() => this.handle401Error(source$)),
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
