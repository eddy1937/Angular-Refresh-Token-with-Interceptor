import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, partition, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { APPLY_TOKEN, QUERY_USERINFO_BY_AUTH } from '../router';
import { setTokenToLocalStorage } from './operator';
import { ACCESS_TOKEN, InterceptorSkipHeader, REFRESH_TOKEN, Token, User, UserInfo, userInfoInit } from './uitls';

const Invalid = 'Invalid';
const { contentPath } = environment;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user$ = new BehaviorSubject<User>(userInfoInit);
  private userWithoutInit$ = this.user$.pipe(filter((u) => u !== userInfoInit));
  public login$: Observable<User>;
  public logout$: Observable<User>;

  constructor(private http: HttpClient) {
    [this.login$, this.logout$] = partition(this.userWithoutInit$,(user) => user !== null);

    this.login$.subscribe((res) => { });
    this.logout$.subscribe((res) => this.removeToken());
  }

  get user() {
    return this.user$.value;
  }

  get isLogin() {
    return !!this.user && this.user !== userInfoInit;
  }

  get accessToken() {
    return localStorage.getItem(ACCESS_TOKEN);
  }

  get refreshToken() {
    return localStorage.getItem(REFRESH_TOKEN);
  }

  get token() {
    const { accessToken, refreshToken } = this;
    return { accessToken, refreshToken };
  }

  get accessTokenIsEmpty() {
    return !this.accessToken;
  }

  get refreshTokenIsEmpty() {
    return !this.refreshToken;
  }

  get tokenIsEmpty() {
    return this.accessTokenIsEmpty && this.refreshTokenIsEmpty;
  }


  applyToken(): Observable<Token> {
    return this.http.post<Token>(`${contentPath}/${APPLY_TOKEN}`, null, InterceptorSkipHeader.options).pipe(setTokenToLocalStorage());
  }

  queryUserInfoByAuth(): Observable<UserInfo> {
    return this.http.post<UserInfo>(`${contentPath}/${QUERY_USERINFO_BY_AUTH}`, null).pipe(tap((user) => this.login(user)));
  }

  refreshTokenFromServer(): Observable<Token> {
    return this.http.post<Token>(`${contentPath}/${REFRESH_TOKEN}`, this.refreshToken, InterceptorSkipHeader.options).pipe(setTokenToLocalStorage());
  }

  removeToken(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
  }

  removeAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN);
  }

  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN);
  }

  makeAccessInvalid(): void {
    localStorage.setItem(ACCESS_TOKEN, Invalid);
  }

  makeRefreshInvalid(): void {
    localStorage.setItem(REFRESH_TOKEN, Invalid);
  }

  login(userInfo: UserInfo) {
    this.user$.next(userInfo);
  }

  logout() {
    this.user$.next(null);
  }
}
