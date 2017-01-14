/* tslint:disable:no-unused-variable */

import { TestBed, async, fakeAsync, tick, inject } from '@angular/core/testing';
import { WindowSizeService } from './window-size.service';

describe('WindowSizeService', () => {

  let service: WindowSizeService;
  let callbacks: any[];

  const mockWindow = {
    innerWidth: 600,
    addEventListener: (eventName, callback) => {
      callbacks.push(callback);
    },
  };

  beforeEach(() => {
    mockWindow.innerWidth = 600;
    callbacks = [];

    TestBed.configureTestingModule({
      providers: [WindowSizeService,
        { provide: 'Window', useFactory: () =>  mockWindow },
      ]
    });
  });

  beforeEach(inject([WindowSizeService], (_service: WindowSizeService) => {
    service = _service;
  }));

  it('should instantiate', () => {
    expect(service).toBeTruthy();
  });

  describe('gridColumnCount', () => {

    it('should initialize', () => {
      expect(service.gridColumnCount.value).toBe(3);
    });

    it('should change on resize', fakeAsync(() => {
      expect(service.gridColumnCount.value).toBe(3);
      expect(callbacks.length).toBe(1);
      mockWindow.innerWidth = 800;
      callbacks[0]();
      tick();
      expect(service.gridColumnCount.value).toBe(4);
    }));

    it('should have a min of 1', fakeAsync(() => {
      mockWindow.innerWidth = 1;
      callbacks[0]();
      tick();
      expect(service.gridColumnCount.value).toBe(1);
    }));

  });

});
