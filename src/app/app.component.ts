import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { concatMap, defer, delay, interval, mergeMap, map, range, switchMap, tap, catchError, repeat, of, EMPTY, throwIfEmpty, filter, defaultIfEmpty, scan, Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth/auth.service';
import { verifyAccessToken, verifyRefreshToken } from './inMemoryData/uitls';
import { HttpLogService, HttpLogType } from './log/http-log.service';
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from './router';

const { contentPath } = environment;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild("log", { static: true })
  private logRef!: ElementRef<HTMLElement>;

  logs: Array<HttpLogType> = [];

  queryUserInfoByAuth$ = this.authService.queryUserInfoByAuth();

  onLogin$ = this.authService.applyToken().pipe(switchMap(() => this.queryUserInfoByAuth$));

  get logElement() {
      return this.logRef.nativeElement;
  }

  constructor(private http: HttpClient, public authService: AuthService, private logService: HttpLogService) {
    this.logService.httpLog$.subscribe((log) => {
      this.logs.push(log);
      setTimeout(() => this.logElement.scrollTop = this.logElement.scrollHeight, 0);
    });
  }

  ngOnInit(): void { }

  onLogin() {
      this.onLogin$.subscribe();
  }

  queryUserInfoByAuth() {
      this.queryUserInfoByAuth$.subscribe();
  }

  ok() {
    this.http.post(`${contentPath}/${OK}`, null).subscribe();
  }

  notFound() {
    this.http.post(`${contentPath}/${NOT_FOUND}`, null).subscribe();
  }

  internalServerError() {
    this.http.post(`${contentPath}/${INTERNAL_SERVER_ERROR}`, null).subscribe();
  }
}
