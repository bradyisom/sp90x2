/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';

describe('Service: AuthGuard', () => {

  const mockAuthService: any = {
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
  });

  beforeEach(() => {
    mockAuthService.user = Observable.of({
      uid: 'U1'
    });
  });

  it('should create', inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));

  it('should resolve to true if logged in', inject([AuthGuard], (service: AuthGuard) => {
    service.canActivateChild(<any>{}, <any>{}).subscribe((loggedIn) => {
      expect(loggedIn).toBe(true);
    });
  }));

  describe('not logged in', () => {
    beforeEach(() => {
      mockAuthService.user = Observable.of(null);
    });

    it('should resolve to false', inject([AuthGuard], (service: AuthGuard) => {
      service.canActivateChild(<any>{}, <any>{}).subscribe((loggedIn) => {
        expect(loggedIn).toBe(false);
      });
    }));

  });
});
