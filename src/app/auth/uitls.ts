import { HttpRequest } from "@angular/common/http";
import { tap } from "rxjs";

export const ACCESS_TOKEN = 'accessToken';
export const REFRESH_TOKEN = 'refreshToken';
export const Invalid = 'Invalid';

export interface Token {
  [ACCESS_TOKEN]: string,
  [REFRESH_TOKEN]: string,
}

function setTokenToLocalStorage() {
  return tap<Token>(({ accessToken, refreshToken }) => {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(REFRESH_TOKEN, refreshToken);
  });
}

export const userInfoInit = 'userInfoInit';

export interface UserInfo {
  account: string,
  username: string,
}

export type User = UserInfo | typeof userInfoInit | null;


class Xheader {
  static readonly interceptorSkipHeader = new Xheader('interceptorSkipHeader');

  readonly headers = { [this.headerName]: this.headerName };
  readonly options = { headers: this.headers };

  private constructor(readonly headerName: string) { }

  public checkHeader({ headers }: HttpRequest<any>) {
    return headers.has(this.headerName);
  }

  public deleteHeader(request: HttpRequest<any>) {
    return request.clone({ headers: request.headers.delete(this.headerName) });
  }
}

export const InterceptorSkipHeader = Xheader.interceptorSkipHeader;
