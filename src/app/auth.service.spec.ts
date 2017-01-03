/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularFire, AuthProviders, AuthMethods, FirebaseAuthState } from 'angularfire2';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

describe('Service: Auth', () => {

  let authData: any = null;
  let authSubject: BehaviorSubject<FirebaseAuthState>;

  let userSet = jasmine.createSpy('user set');
  let mockAngularFire = {
    database: {
      list: () => Observable.of([]),
      object: () => {
        let result = Observable.of({
          uid: 'U1'
        });
        (<any>result).set = userSet;
        return result;
      }
    },
    auth: Observable.of(null)
  };

  let mockRouter = {
    url: '',
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      // imports: [
      //   RouterTestingModule.withRoutes([])
      // ],
      providers: [
        AuthService,
        { provide: AngularFire, useValue: mockAngularFire },
        { provide: Router, useValue: mockRouter }
      ]
    });

    mockRouter.url = '';

    authData = null;
    authSubject = new BehaviorSubject<FirebaseAuthState>(null);
    spyOn(mockAngularFire.auth, 'subscribe').and.callFake((callback) => {
      authSubject.subscribe(callback);
    });
    (<any>mockAngularFire.auth).login = jasmine.createSpy('login');
    (<any>mockAngularFire.auth).logout = jasmine.createSpy('logout');
    (<any>mockAngularFire.auth).createUser = jasmine.createSpy('createUser', () => {
      return Promise.resolve({ uid: 'U1'});
    }).and.callThrough();
  });

  it('should create', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it('should return a null user', inject([AuthService], (service: AuthService) => {
    service.user.subscribe((user) => {
      expect(user).toBeNull();
    });
  }));

  describe('logged in', () => {
    beforeEach(() => {
      authData = {
        uid: 'U1',
        provider: AuthProviders.Password
      };
      authSubject.next(authData);
    });

    it('should return a user', inject([AuthService], (service: AuthService) => {
      service.user.subscribe((user) => {
        expect(user.uid).toBe('U1');
      });
    }));

    describe('non-login routes', () => {
      it('should not navigate', inject([AuthService], (service: AuthService) => {
        expect(mockRouter.navigate).not.toHaveBeenCalled();
      }));
    });
    describe('login route', () => {
      beforeEach(() => {
        mockRouter.url = '/login';
      });
      it('should navigate home', inject([AuthService], (service: AuthService) => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      }));
    });

    describe('Google user', () => {
      beforeEach(() => {
        authData = {
          uid: 'U1',
          provider: AuthProviders.Google,
          google: {
            email: 'bradyisom@gmail.com',
            displayName: 'Brady Isom',
            photoURL: 'http://goog.le/avatar.png'
          }
        };
        authSubject.next(authData);
      });

      it('should set user details', inject([AuthService], (service: AuthService) => {
        service.user.subscribe((user) => {
          expect(userSet).toHaveBeenCalledWith({
            uid: 'U1',
            email: 'bradyisom@gmail.com',
            displayName: 'Brady Isom',
            avatar: 'http://goog.le/avatar.png'
          });
        });
      }));
    });

    describe('Facebook user', () => {
      beforeEach(() => {
        authData = {
          uid: 'U1',
          provider: AuthProviders.Facebook,
          facebook: {
            email: 'bradyisom@gmail.com',
            displayName: 'Brady Isom',
            photoURL: 'http://goog.le/avatar.png'
          }
        };
        authSubject.next(authData);
      });

      it('should set user details', inject([AuthService], (service: AuthService) => {
        service.user.subscribe((user) => {
          expect(userSet).toHaveBeenCalledWith({
            uid: 'U1',
            email: 'bradyisom@gmail.com',
            displayName: 'Brady Isom',
            avatar: 'http://goog.le/avatar.png'
          });
        });
      }));
    });

  });

  describe('create', () => {
    it('should create a user', inject([AuthService], (service: AuthService) => {
      service.create('Brady Isom', 'bradyisom@gmail.com', 'password', 'https://goog.le/avatar.png');
      expect((<any>mockAngularFire.auth).createUser).toHaveBeenCalledWith({
        email: 'bradyisom@gmail.com',
        password: 'password'
      });
      expect(userSet).toHaveBeenCalledWith({
        uid: 'U1',
        email: 'bradyisom@gmail.com',
        displayName: 'Brady Isom',
        avatar: 'http://goog.le/avatar.png'
      });
    }));
  });

  describe('login', () => {
    it('should login with password', inject([AuthService], (service: AuthService) => {
      service.login('bradyisom@gmail.com', 'password');
      expect((<any>mockAngularFire.auth).login).toHaveBeenCalledWith({
        email: 'bradyisom@gmail.com',
        password: 'password'
      });
    }));
  });

  describe('googleLogin', () => {
    it('should login', inject([AuthService], (service: AuthService) => {
      service.googleLogin();
      expect((<any>mockAngularFire.auth).login).toHaveBeenCalledWith({
        provider: AuthProviders.Google,
        method: AuthMethods.Popup,
        scope: ['email']
      });
    }));
  });

  describe('facebookLogin', () => {
    it('should login', inject([AuthService], (service: AuthService) => {
      service.facebookLogin();
      expect((<any>mockAngularFire.auth).login).toHaveBeenCalledWith({
        provider: AuthProviders.Facebook,
        method: AuthMethods.Popup,
        scope: ['email']
      });
    }));
  });

  describe('logout', () => {
    beforeEach(() => {
      authData = {
        uid: 'U1',
        provider: AuthProviders.Password
      };
      authSubject.next(authData);
    });

    it('should clear the user object', inject([AuthService], (service: AuthService) => {
      let currentUser;
      service.user.subscribe(user => {
        currentUser = user;
      });
      expect(currentUser).not.toBeFalsy();
      service.logout();
      expect(currentUser).toBeFalsy();
    }));

    it('should navigate home', inject([AuthService], (service: AuthService) => {
      service.logout();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should logout', inject([AuthService], (service: AuthService) => {
      service.logout();
      expect((<any>mockAngularFire.auth).logout).toHaveBeenCalled();
    }));

  });

});
