/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AngularFire } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { ScheduleService } from './schedule.service';

import * as _ from 'lodash';

describe('ScheduleService', () => {

  let service: ScheduleService;

  const mockAngularFire = {
    database: {
      list: jasmine.createSpy('list', () => {
        return Observable.of([{
          title: 'Schedule One',
          startDate: '2017-01-14T00:00:00Z',
        }, {
          title: 'Schedule Two',
          startDate: '2017-04-14T00:00:00Z',
        }]);
      }).and.callThrough(),
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScheduleService,
        { provide: AngularFire, useValue: mockAngularFire },
      ]
    });
  });

  beforeEach(inject([ScheduleService], (_service: ScheduleService) => {
    service = _service;
  }));

  it('should instantiate', () => {
    expect(service).toBeTruthy();
  });


  describe('listSchedules', () => {

    it('should return schedules', () => {
      const result = service.listSchedules('U1');
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/schedules/U1', {
        query: {
          orderByChild: 'startDate'
        }
      });
      result.first().subscribe((list) => {
        expect(_.map(list, (s: any) => s.title)).toEqual([
          'Schedule Two',
          'Schedule One'
        ]);
      });
    });

  });

});
