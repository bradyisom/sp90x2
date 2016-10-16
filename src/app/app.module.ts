import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@angular/material';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import { Gravatar } from 'ng2-gravatar-directive';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SchedulesComponent } from './schedules/schedules.component';

export const firebaseConfig = {
  apiKey: "AIzaSyDX5ot8wh4i9EXP4Tpx_3Y8SU3o6S1dIAo",
  authDomain: "sp90x.firebaseapp.com",
  databaseURL: "https://sp90x.firebaseio.com",
  storageBucket: "project-8976456987898776126.appspot.com",
  messagingSenderId: "812558087097"
};

export const firebaseAuthConfig = {
  provider: AuthProviders.Password,
  method: AuthMethods.Password
};

@NgModule({
  declarations: [
    AppComponent,
    Gravatar,
    LoginComponent,
    HomeComponent,
    SchedulesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig, firebaseAuthConfig),
    RouterModule.forRoot([
      {
        path: '',
        component: HomeComponent
      },
      { 
        path: '',
        canActivateChild: [AuthGuard],
        children: [{
            path: 'schedules',
            component: SchedulesComponent
        }]
      },
      { path: 'login', component: LoginComponent }
    ])
  ],
  providers: [
    AuthService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
