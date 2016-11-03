/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AuthResolverService } from './auth-resolver.service';

describe('Service: AuthResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthResolverService]
    });
  });

  it('should ...', inject([AuthResolverService], (service: AuthResolverService) => {
    expect(service).toBeTruthy();
  }));
});
