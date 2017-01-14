/* tslint:disable:no-unused-variable */

import { TestBed, async, fakeAsync, tick, inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularFire, AuthProviders, AuthMethods, FirebaseAuthState } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AuthService } from './auth.service';
import { GroupService } from './models/group.service';

describe('Service: Auth', () => {

  let authData: any = null;
  let authSubject: BehaviorSubject<FirebaseAuthState>;

  let rejectAuthDelete = false;
  let rejectUserDelete = false;

  const userUpdate = jasmine.createSpy('user update');
  const userRemove = jasmine.createSpy('user remove',
    () => {
      if (rejectUserDelete) {
        return Promise.reject('User delete error');
      }
      return Promise.resolve(true);
    }
  ).and.callThrough();
  const entriesRemove = jasmine.createSpy('entries remove',
    () => Promise.resolve(true)
  ).and.callThrough();
  const schedulesRemove = jasmine.createSpy('schedules remove',
    () => Promise.resolve(true)
  ).and.callThrough();
  const authDelete = jasmine.createSpy('auth delete',
    () => {
      if (rejectAuthDelete) {
        return Promise.reject('Auth delete error');
      }
      return Promise.resolve(true);
    }
  ).and.callThrough();

  const mockAngularFire = {
    database: {
      list: () => Observable.of([]),
      object: jasmine.createSpy('object', (path: string): any => {
        let result: any;
        if (path.startsWith('/schedules/')) {
          result = Observable.of({
            $key: 'MAINKEY',
            SCHED1: {},
            SCHED2: {}
          });
          (<any>result).remove = schedulesRemove;
        } else if (path.startsWith('/entries/')) {
          result = Observable.of({});
          (<any>result).remove = entriesRemove;
        } else {
          result = Observable.of({
            uid: 'U1'
          });
          (<any>result).update = userUpdate;
          (<any>result).remove = userRemove;
        }
        return result;
      }).and.callThrough()
    },
    auth: Observable.of(null)
  };

  const mockRouter = {
    url: '',
    navigate: jasmine.createSpy('navigate')
  };

  let ownedGroups: any[];
  let rejectGroupDelete = false;
  const mockGroup = {
    delete: jasmine.createSpy('delete group', () => {
      if (rejectGroupDelete) {
        return Promise.reject('Group delete error');
      }
      return Promise.resolve({});
    }).and.callThrough(),
    list: jasmine.createSpy('list groups', () => {
      return Observable.of(ownedGroups);
    }).and.callThrough(),
  };

  beforeEach(() => {
    mockAngularFire.database.object.calls.reset();
    mockGroup.delete.calls.reset();
    mockGroup.list.calls.reset();
    userUpdate.calls.reset();
    userRemove.calls.reset();
    entriesRemove.calls.reset();
    schedulesRemove.calls.reset();
    authDelete.calls.reset();

    ownedGroups = [];
    rejectGroupDelete = false;
    rejectAuthDelete = false;
    rejectUserDelete = false;

    TestBed.configureTestingModule({
      // imports: [
      //   RouterTestingModule.withRoutes([])
      // ],
      providers: [
        AuthService,
        { provide: AngularFire, useValue: mockAngularFire },
        { provide: Router, useValue: mockRouter },
        { provide: GroupService, useValue: mockGroup },
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
          expect(userUpdate).toHaveBeenCalledWith({
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
          expect(userUpdate).toHaveBeenCalledWith({
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
    it('should create a user', fakeAsync(inject([AuthService], (service: AuthService) => {
      service.create('Brady Isom', 'bradyisom@gmail.com', 'password', 'https://goog.le/avatar.png');
      expect((<any>mockAngularFire.auth).createUser).toHaveBeenCalledWith({
        email: 'bradyisom@gmail.com',
        password: 'password'
      });
      tick();
      expect(userUpdate).toHaveBeenCalledWith({
        uid: 'U1',
        email: 'bradyisom@gmail.com',
        displayName: 'Brady Isom',
        avatar: 'https://goog.le/avatar.png'
      });
    })));
  });


  describe('delete', () => {

    describe('not logged in', () => {
      beforeEach(() => {
        authData = null;
        authSubject.next(authData);
      });

      it('should noop', fakeAsync(inject([AuthService], (service: AuthService) => {
        let rejected = false;
        service.delete().catch((err) => rejected = true);
        tick();
        expect(rejected).toBe(true);
        expect(authDelete).not.toHaveBeenCalled();
      })));
    });


    describe('logged in', () => {
      beforeEach(() => {
        authData = {
          uid: 'U1',
          provider: AuthProviders.Password,
          auth: {
            delete: authDelete
          }
        };
        authSubject.next(authData);
      });

      it('should delete the users data', fakeAsync(inject([AuthService], (service: AuthService) => {
        spyOn(service, 'logout').and.callFake(() => {});
        service.delete();
        tick();
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/schedules/U1');
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/entries/SCHED1');
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/entries/SCHED2');
        expect(entriesRemove).toHaveBeenCalledTimes(2);
        expect(mockGroup.list).toHaveBeenCalledWith({
          query: {
            orderByChild: 'owner',
            equalTo: 'U1',
          }
        });
        expect(mockGroup.delete).not.toHaveBeenCalled();
        expect(schedulesRemove).toHaveBeenCalled();
        expect(userRemove).toHaveBeenCalled();
        expect(authDelete).toHaveBeenCalled();
        expect(service.logout).toHaveBeenCalled();
      })));

      it('should delete the users data with owned groups', fakeAsync(inject([AuthService], (service: AuthService) => {
        ownedGroups = [{
          $key: 'G1'
        }];
        spyOn(service, 'logout').and.callFake(() => {});
        service.delete();
        tick();
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/schedules/U1');
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/entries/SCHED1');
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/entries/SCHED2');
        expect(entriesRemove).toHaveBeenCalledTimes(2);
        expect(mockGroup.list).toHaveBeenCalledWith({
          query: {
            orderByChild: 'owner',
            equalTo: 'U1',
          }
        });
        expect(mockGroup.delete).toHaveBeenCalledWith('G1');
        expect(schedulesRemove).toHaveBeenCalled();
        expect(userRemove).toHaveBeenCalled();
        expect(authDelete).toHaveBeenCalled();
        expect(service.logout).toHaveBeenCalled();
      })));

      it('should reject on delete group error', fakeAsync(inject([AuthService], (service: AuthService) => {
          ownedGroups = [{
            $key: 'G1'
          }];
          rejectGroupDelete = true;
          let rejectedErr = '';
          service.delete().catch((err) => rejectedErr = err);
          tick();
          expect(rejectedErr).toBe('Group delete error');
      })));

      it('should reject on delete user error', fakeAsync(inject([AuthService], (service: AuthService) => {
          rejectUserDelete = true;
          let rejectedErr = '';
          service.delete().catch((err) => rejectedErr = err);
          tick();
          expect(rejectedErr).toBe('User delete error');
      })));

      it('should reject on delete auth error', fakeAsync(inject([AuthService], (service: AuthService) => {
          rejectAuthDelete = true;
          let rejectedErr = '';
          service.delete().catch((err) => rejectedErr = err);
          tick();
          expect(rejectedErr).toBe('Auth delete error');
      })));
    });

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
