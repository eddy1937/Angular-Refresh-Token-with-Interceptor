import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { delay } from 'rxjs';

import { AppComponent } from './app.component';
import { AuthHttpInterceptor } from './auth/auth-http-interceptor';
import { AuthService } from './auth/auth.service';
import { InMemoryDataService } from './inMemoryData/in-memory-data.service';
import { HttpLogInterceptor } from './log/http-log-interceptor';
import { AppRoutingModule } from './app-routing.module';

function initFactory(authService: AuthService) {
  return () => authService.queryUserInfoByAuth().pipe(delay(600));
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { dataEncapsulation: false }),
    AppRoutingModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initFactory,
      multi: true,
      deps: [AuthService]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpLogInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
