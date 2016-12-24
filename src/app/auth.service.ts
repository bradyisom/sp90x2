import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFire, AuthProviders, AuthMethods, FirebaseObjectObservable } from 'angularfire2';
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
        let subscription: Subscription = this._user.subscribe((u: any) => {
          subscription.unsubscribe();
          // Create the user object
          if (auth.provider === AuthProviders.Google) {
            this._user.set({
              uid: auth.uid,
              email: auth.google.email,
              displayName: auth.google.displayName,
              avatar: auth.google.photoURL
            });
          } else if (auth.provider === AuthProviders.Facebook) {
            this._user.set({
              uid: auth.uid,
              email: auth.facebook.email,
              displayName: auth.facebook.displayName,
              avatar: auth.facebook.photoURL
            });
          }
          this.user.next(u);
          if (this.router.url === '/login') {
            this.router.navigate(['/']);
          }
        });
      } else {
        this._user = null;
        this.user.next(null);
      }
    });
  }

  login (email: string, password: string) {
    this.af.auth.login({
      email: email,
      password: password
    });
  }

  googleLogin() {
    this.af.auth.login({
      provider: AuthProviders.Google,
      method: AuthMethods.Popup,
      scope: ['email']
    });
  }

  facebookLogin() {
    this.af.auth.login({
      provider: AuthProviders.Facebook,
      method: AuthMethods.Popup,
      scope: ['email']
    });
  }

  logout() {
    this._user = null;
    this.user.next(null);
    this.router.navigate(['/']);
    this.af.auth.logout();
  }

}
