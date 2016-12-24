/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';

describe('Service: AuthGuard', () => {

  const mockAuthService = {
    user: Observable.of({
      uid: 'U1'
    })
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

  it('should create', inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));
});
