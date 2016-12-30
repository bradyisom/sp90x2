/* tslint:disable:no-unused-variable */
import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from '../auth.service';
import { ErrorService } from '../error.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  let success: boolean;
  const mockAuthService = {
    create: jasmine.createSpy('create', () => {
      return success ? Promise.resolve() : Promise.reject('Creation error');
    }).and.callThrough(),
    login: jasmine.createSpy('login', () => {
      return Promise.resolve();
    }).and.callThrough()
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  const mockErrorService = {
    show: jasmine.createSpy('show')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ErrorService, useValue: mockErrorService },
      ],
      declarations: [ RegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    success = true;

    mockErrorService.show.calls.reset();
    mockRouter.navigate.calls.reset();
    mockAuthService.create.calls.reset();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should setup the edit form', () => {
    expect(component.editForm.controls['firstName'].value).toBeFalsy();
    expect(component.editForm.controls['lastName'].value).toBeFalsy();
    expect(component.editForm.controls['email'].value).toBeFalsy();
    expect(component.editForm.controls['password'].value).toBeFalsy();
    expect(component.editForm.controls['passwordConfirm'].value).toBeFalsy();
    expect(component.editForm.valid).toBeFalsy();
  });

  it('should handle a valid form', () => {
    component.editForm.setValue({
      firstName: 'Brady',
      lastName: 'Isom',
      email: 'bradyisom@gmail.com',
      password: 'password',
      passwordConfirm: 'password'
    });
    expect(component.editForm.valid).toBeTruthy();
  });

  it('should invalidate on mismatched passwords', () => {
    component.editForm.setValue({
      firstName: 'Brady',
      lastName: 'Isom',
      email: 'bradyisom@gmail.com',
      password: 'password',
      passwordConfirm: 'password2'
    });
    expect(component.editForm.valid).toBeFalsy();
  });

  describe('getGravatarUrl', () => {
    it('should get a URL for an email', () => {
      component.editForm.setValue({
        firstName: 'Brady',
        lastName: 'Isom',
        email: 'bradyisom@gmail.com',
        password: 'password',
        passwordConfirm: 'password'
      });
      expect(component.getGravatarUrl()).toBe(
        'https://www.gravatar.com/avatar/368d88292fecdb9686c5d532a474af88?s=80&d=retro'
      );
    });

    it('should get a URL for an empty email', () => {
      expect(component.getGravatarUrl()).toBe(
        'https://www.gravatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e?s=80&d=retro'
      );
    });
  });

  describe('create', () => {
    beforeEach(() => {
      component.editForm.setValue({
        firstName: 'Brady',
        lastName: 'Isom',
        email: 'bradyisom@gmail.com',
        password: 'password',
        passwordConfirm: 'password'
      });
    });

    it('should create a user', fakeAsync(() => {
      component.create();
      expect(mockAuthService.create).toHaveBeenCalledWith(
        'Brady Isom', 'bradyisom@gmail.com', 'password',
        'https://www.gravatar.com/avatar/368d88292fecdb9686c5d532a474af88?s=80&d=retro'
      );
    }));

    it('should login on success', fakeAsync(() => {
      component.create();
      tick();
      expect(mockAuthService.login).toHaveBeenCalledWith(
        'bradyisom@gmail.com', 'password'
      );
    }));

    it('should navigate to home on success', fakeAsync(() => {
      component.create();
      tick();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should show an error', fakeAsync(() => {
      success = false;
      component.create();
      tick();
      expect(mockErrorService.show).toHaveBeenCalled();
    }));
  });

  describe('cancel', () => {
    it('should navigate to login', () => {
      component.cancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

});
