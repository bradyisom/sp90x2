import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@angular/material';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import { Gravatar } from 'ng2-gravatar-directive';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';
import { AuthResolver } from './auth-resolver.service';


import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { EditScheduleComponent } from './edit-schedule/edit-schedule.component';
import { TrackComponent } from './track/track.component';
import { FitTestComponent } from './fit-test/fit-test.component';

import 'hammerjs';

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
    EditScheduleComponent,
    TrackComponent,
    FitTestComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig, firebaseAuthConfig),
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent
      },
      { 
        path: '',
        canActivateChild: [AuthGuard],
        children: [{
            path: 'newschedule',
            component: EditScheduleComponent
        }, {
            path: 'editschedule/:id',
            component: EditScheduleComponent
        }, {
            path: 'track/:scheduleId',
            component: TrackComponent,
            resolve: {
              user: AuthResolver
            },
        }, {
            path: 'track/:scheduleId/:date',
            component: TrackComponent,
            resolve: {
              user: AuthResolver
            },
        }, {
            path: 'fittest/:scheduleId/:date',
            component: FitTestComponent,
            resolve: {
              user: AuthResolver
            },
        }]
      },
      { 
        path: 'login',
        component: LoginComponent
      }
    ], {
      initialNavigation: true
    })
  ],
  providers: [
    AuthService,
    AuthGuard,
    AuthResolver
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
