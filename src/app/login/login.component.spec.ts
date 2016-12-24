/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const mockAuthService = {
    user: Observable.of({
      uid: 'U1'
    }),
    login: jasmine.createSpy('login'),
    googleLogin: jasmine.createSpy('googleLogin'),
    facebookLogin: jasmine.createSpy('facebookLogin')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule.forRoot(),
        FormsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ],
      declarations: [ LoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
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
  });

  describe('googleLogin', () => {
    it('should login to Google', () => {
      component.googleLogin();
      expect(mockAuthService.googleLogin).toHaveBeenCalled();
    });
  });

  describe('facebookLogin', () => {
    it('should login to Facebook', () => {
      component.facebookLogin();
      expect(mockAuthService.facebookLogin).toHaveBeenCalled();
    });
  });
});
