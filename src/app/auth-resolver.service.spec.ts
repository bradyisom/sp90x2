/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

import { AuthResolver } from './auth-resolver.service';

describe('Service: AuthResolver', () => {
  const mockAuthService = {
    user: Observable.of({
      uid: 'U1'
    })
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
  });

  it('should create', inject([AuthResolver], (service: AuthResolver) => {
    expect(service).toBeTruthy();
  }));

  it('should resolve with the current user', inject([AuthResolver], (service: AuthResolver) => {
    service.resolve().subscribe((user) => {
      expect(user.uid).toBe('U1');
    });
  }));

});
