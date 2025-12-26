import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { OktaAuthModule, OKTA_CONFIG } from '@okta/okta-angular';

import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { LoginCallbackComponent } from './auth/login-callback.component';
import { LogoutComponent } from './auth/logout.component';
import { oktaAuth } from './auth/okta.config';
import { NotFoundComponent } from './view/not-found/not-found.component';

@NgModule({
  declarations: [AppComponent, LoginCallbackComponent, LogoutComponent, NotFoundComponent],
  imports: [BrowserModule, RouterModule.forRoot(appRoutes), OktaAuthModule],
  providers: [{ provide: OKTA_CONFIG, useValue: { oktaAuth } }],
  bootstrap: [AppComponent],
})
export class AppModule {}
