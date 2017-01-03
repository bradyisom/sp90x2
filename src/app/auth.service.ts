import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AngularFire, AuthProviders, AuthMethods,
  FirebaseAuthState,
  FirebaseObjectObservable
} from 'angularfire2';
import { ReplaySubject, Subscription } from 'rxjs';

@Injectable()
export class AuthService {

  public user: ReplaySubject<any> = new ReplaySubject<any>(1);
  private _user: FirebaseObjectObservable<any>;

  constructor(private af: AngularFire, private router: Router) {
    this.af.auth.subscribe(auth => {
      // console.log('auth', auth);
      if (auth) {
        this._user = af.database.object(`/users/${auth.uid}`);
        this._user.take(1).subscribe((u: any) => {
          // Create the user object
          if (auth.provider === AuthProviders.Google) {
            this.updateUser(
              auth.uid,
              auth.google.displayName,
              auth.google.email,
              auth.google.photoURL
            );
          } else if (auth.provider === AuthProviders.Facebook) {
            this.updateUser(
              auth.uid,
              auth.facebook.displayName,
              auth.facebook.email,
              auth.facebook.photoURL
            );
          }
          this.user.next(u);
          if (this.router.url === '/login') {
            this.router.navigate(['/home']);
          }
        });
      } else {
        this._user = null;
        this.user.next(null);
      }
    });
  }

  create (displayName: string, email: string, password: string, avatarUrl: string): firebase.Promise<any> {
    return this.af.auth.createUser({
      email: email,
      password: password
    }).then((state: FirebaseAuthState) => {
      return this.updateUser(state.uid, displayName, email, avatarUrl);
    });
  }

  updateUser (uid: string, displayName: string, email: string, avatarUrl: string): firebase.Promise<void> {
    let user = this.af.database.object(`/users/${uid}`);
    return user.set({
      uid: uid,
      email: email,
      displayName: displayName,
      avatar: avatarUrl
    });
  }

  login (email: string, password: string): firebase.Promise<FirebaseAuthState> {
    return this.af.auth.login({
      email: email,
      password: password
    });
  }

  googleLogin(): firebase.Promise<FirebaseAuthState> {
    return this.af.auth.login({
      provider: AuthProviders.Google,
      method: AuthMethods.Popup,
      scope: ['email']
    });
  }

  facebookLogin(): firebase.Promise<FirebaseAuthState> {
    return this.af.auth.login({
      provider: AuthProviders.Facebook,
      method: AuthMethods.Popup,
      scope: ['email']
    });
  }

  logout(): void {
    this._user = null;
    this.user.next(null);
    this.router.navigate(['/']);
    this.af.auth.logout();
  }

}
