/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularFire } from 'angularfire2';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

describe('Service: Auth', () => {

  const mockAngularFire = {
    database: {
      list: () => Observable.of([]),
      object: () => Observable.of({})
    },
    auth: Observable.of(null)
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        AuthService,
        { provide: AngularFire, useValue: mockAngularFire }
      ]
    });
  });

  it('should create', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
