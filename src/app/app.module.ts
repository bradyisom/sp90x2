import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@angular/material';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { environment } from '../environments/environment';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';
import { AuthResolver } from './auth-resolver.service';
import { ErrorService, ErrorComponent } from './error.service';
import { ConfirmService, ConfirmComponent } from './confirm.service';
import { WindowSizeService } from './window-size.service';
import { ScheduleService } from './models/schedule.service';
import { GroupService } from './models/group.service';

import 'hammerjs';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { EditScheduleComponent } from './edit-schedule/edit-schedule.component';
import { TrackComponent } from './track/track.component';
import { FitTestComponent } from './fit-test/fit-test.component';
import { RegisterComponent } from './register/register.component';
import { ProgressComponent } from './progress/progress.component';
import { AboutComponent } from './about/about.component';
import { GroupsComponent } from './groups/groups.component';
import { EditGroupComponent } from './edit-group/edit-group.component';
import { GroupComponent } from './group/group.component';

let config: any = {
  apiKey: 'AIzaSyDcZ18iVjI89jkpRq0SDsF5OeWrACtyFrE',
  authDomain: 'sp90x-dev.firebaseapp.com',
  databaseURL: 'https://sp90x-dev.firebaseio.com',
  storageBucket: 'sp90x-dev.appspot.com',
  messagingSenderId: '15702666865'
};
if (environment.production) {
  config = {
    apiKey: 'AIzaSyDX5ot8wh4i9EXP4Tpx_3Y8SU3o6S1dIAo',
    authDomain: 'sp90x.firebaseapp.com',
    databaseURL: 'https://sp90x.firebaseio.com',
    storageBucket: 'project-8976456987898776126.appspot.com',
    messagingSenderId: '812558087097'
  };
}
export const firebaseConfig = config;

export const firebaseAuthConfig = {
  provider: AuthProviders.Password,
  method: AuthMethods.Password
};

export function _window(): any {
  return window;
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    EditScheduleComponent,
    TrackComponent,
    FitTestComponent,
    RegisterComponent,
    ErrorComponent,
    ConfirmComponent,
    ProgressComponent,
    AboutComponent,
    GroupsComponent,
    EditGroupComponent,
    GroupComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    ChartsModule,
    AngularFireModule.initializeApp(firebaseConfig, firebaseAuthConfig),
    RouterModule.forRoot([{
      path: '',
      redirectTo: '/about',
      pathMatch: 'full'
    }, {
      path: 'about',
      component: AboutComponent,
      data: {
        title: 'About'
      }
    }, {
      path: '',
      canActivateChild: [AuthGuard],
      children: [{
        path: 'home',
        component: HomeComponent,
        resolve: {
          user: AuthResolver
        },
        data: {
          title: 'Home'
        }
      }, {
          path: 'newschedule',
          component: EditScheduleComponent,
          data: {
            title: 'Create Schedule'
          }
      }, {
          path: 'editschedule/:id',
          component: EditScheduleComponent,
          data: {
            title: 'Edit Schedule'
          }
      }, {
          path: 'track/:scheduleId',
          component: TrackComponent,
          resolve: {
            user: AuthResolver
          }
      }, {
          path: 'track/:scheduleId/:date',
          component: TrackComponent,
          resolve: {
            user: AuthResolver
          },
          data: {
            title: 'Track'
          }
      }, {
          path: 'fittest/:scheduleId/:date',
          component: FitTestComponent,
          resolve: {
            user: AuthResolver
          },
      }, {
          path: 'progress',
          component: ProgressComponent,
          resolve: {
            user: AuthResolver
          },
          data: {
            title: 'Progress'
          }
      }, {
          path: 'groups',
          component: GroupsComponent,
          resolve: {
            user: AuthResolver
          },
          data: {
            title: 'Groups'
          }
      }, {
          path: 'newgroup',
          component: EditGroupComponent,
          resolve: {
            user: AuthResolver
          },
          data: {
            title: 'Create Group'
          }
      }, {
          path: 'editgroup/:id',
          component: EditGroupComponent,
          resolve: {
            user: AuthResolver
          },
          data: {
            title: 'Edit Group'
          }
      }, {
          path: 'group/:id',
          component: GroupComponent,
          resolve: {
            user: AuthResolver
          },
          data: {
            title: 'Group'
          }
      }]
    }, {
      path: 'login',
      component: LoginComponent,
      data: {
        title: 'Login'
      }
    }, {
      path: 'register',
      component: RegisterComponent,
      data: {
        title: 'Create an Account'
      }
    }], {
      initialNavigation: true
    })
  ],
  providers: [
    { provide: 'Window', useFactory: _window },
    AuthService,
    AuthGuard,
    AuthResolver,
    ErrorService,
    ConfirmService,
    ScheduleService,
    GroupService,
    WindowSizeService,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ErrorComponent,
    ConfirmComponent,
  ]
})
export class AppModule { }
