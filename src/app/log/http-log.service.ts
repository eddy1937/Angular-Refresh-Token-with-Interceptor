import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface HttpLogType {
  ok: boolean,
  url: string | null,
  status: number,
  statusText: string,
}

@Injectable({
  providedIn: 'root'
})
export class HttpLogService {

  private readonly httpLog = new Subject<HttpLogType>();
  public readonly httpLog$ = this.httpLog.asObservable();

  constructor() { }

  public logResponse(log: HttpLogType) {
      this.httpLog.next(log);
  }
}
