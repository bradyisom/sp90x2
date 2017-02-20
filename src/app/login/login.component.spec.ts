/* tslint:disable:no-unused-variable */
import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth.service';
import { ErrorService } from '../error.service';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let success: boolean;

  const mockAuthService = {
    user: Observable.of({
      uid: 'U1'
    }),
    login: jasmine.createSpy('login', () => {
      return success ? Promise.resolve() : Promise.reject('Login error');
    }).and.callThrough(),
    googleLogin: jasmine.createSpy('googleLogin', () => {
      return success ? Promise.resolve() : Promise.reject('Google login error');
    }).and.callThrough(),
    facebookLogin: jasmine.createSpy('facebookLogin', () => {
      return success ? Promise.resolve() : Promise.reject('Facebook login error');
    }).and.callThrough()
  };

  const mockErrorService = {
    show: jasmine.createSpy('error')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule.forRoot(),
        FormsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ErrorService, useValue: mockErrorService }
      ],
      declarations: [ LoginComponent ]
    });

    success = true;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('login', () => {
    it('should login with password', () => {
      component.email = 'bradyisom@gmail.com';
      component.password = 'password1';
      component.login();
      expect(mockAuthService.login).toHaveBeenCalledWith('bradyisom@gmail.com', 'password1');
    });

    it('should show an error', fakeAsync(() => {
      success = false;
      component.login();
      tick();
      expect(mockErrorService.show).toHaveBeenCalled();
    }));
  });

  describe('googleLogin', () => {
    it('should login to Google', () => {
      component.googleLogin();
      expect(mockAuthService.googleLogin).toHaveBeenCalled();
    });

    it('should show an error', fakeAsync(() => {
      success = false;
      component.googleLogin();
      tick();
      expect(mockErrorService.show).toHaveBeenCalled();
    }));
  });

  describe('facebookLogin', () => {
    it('should login to Facebook', () => {
      component.facebookLogin();
      expect(mockAuthService.facebookLogin).toHaveBeenCalled();
    });

    it('should show an error', fakeAsync(() => {
      success = false;
      component.facebookLogin();
      tick();
      expect(mockErrorService.show).toHaveBeenCalled();
    }));
  });
});
