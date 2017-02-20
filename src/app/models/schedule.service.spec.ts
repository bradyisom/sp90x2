/* tslint:disable:no-unused-variable */

import { TestBed, async, fakeAsync, tick, inject } from '@angular/core/testing';
import { AngularFire, FirebaseApp } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { ScheduleService } from './schedule.service';

import * as _ from 'lodash';

describe('ScheduleService', () => {

  let service: ScheduleService;

  let schedule: any;

  const pushSpy = jasmine.createSpy('push', () => {
    return Promise.resolve({
      key: 'NEWSCHED'
    });
  }).and.callThrough();
  const setSpy = jasmine.createSpy('set', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const setGroupUserSpy = jasmine.createSpy('set group user', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const updateGroupUserSpy = jasmine.createSpy('update group user', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const removeEntrySpy = jasmine.createSpy('remove entry', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const updateEntrySpy = jasmine.createSpy('update entry', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const removeScheduleSpy = jasmine.createSpy('remove schedule', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const updateScheduleSpy = jasmine.createSpy('update schedule', () => {
    return Promise.resolve({});
  }).and.callThrough();

  const mockAngularFire = {
    database: {
      list: jasmine.createSpy('list', () => {
        const result: any = Observable.of([{
          title: 'Schedule One',
          startDate: '2017-01-14T00:00:00Z',
        }, {
          title: 'Schedule Two',
          startDate: '2017-04-14T00:00:00Z',
        }]);
        result.push = pushSpy;
        return result;
      }).and.callThrough(),
      object: jasmine.createSpy('object', (path: string) => {
        if (path === '/tasks') {
          return Observable.of({
            BOFM90: {
              title: 'Book of Mormon 90',
              description: 'Desc 1',
              defaultInterval: 'daily',
              points: 1,
              subTasks: true
            },
            DTG: {
              title: 'Duty to God',
              description: 'Desc 2',
              points: 1,
              defaultInterval: 'Su'
            },
            FASTING: {
              title: 'Fasting',
              description: 'Desc 3',
              points: 20,
              defaultInterval: 'monthly'
            },
            GC: {
              title: 'General Conference',
              description: 'Desc 4',
              points: 1,
              defaultInterval: 'Mo,Th'
            }
          });
        } else if (path.startsWith('/entries')) {
          const result: any = Observable.of({});
          result.set = setSpy;
          result.remove = removeEntrySpy;
          result.update = updateEntrySpy;
          return result;
        } else if (path.startsWith('/schedules')) {
          const result: any = Observable.of(schedule);
          result.remove = removeScheduleSpy;
          result.update = updateScheduleSpy;
          return result;
        } else if (path.startsWith('/groupUsers')) {
          const result: any = Observable.of({
            schedule: 'S1',
            points: 4,
            pointsPossible: 10,
            displayName: 'John Doe',
            $key: 'MyKey'
          });
          result.set = setGroupUserSpy;
          result.update = updateGroupUserSpy;
          return result;
        }
        return Observable.of({});
      }).and.callThrough(),
    }
  };

  const deleteFileSpy = jasmine.createSpy('delete', () => {
    return Promise.resolve({});
  }).and.callThrough();

  const storageChildSpy = jasmine.createSpy('storage ref', () => {
    return {
      delete: deleteFileSpy
    };
  }).and.callThrough();

  const mockFirebase = {
    storage: () => {
      return {
        ref: () => {
          return {
            child: storageChildSpy
          };
        }
      };
    }
  };

  beforeEach(() => {
    mockAngularFire.database.list.calls.reset();
    mockAngularFire.database.object.calls.reset();
    pushSpy.calls.reset();
    setSpy.calls.reset();
    setGroupUserSpy.calls.reset();
    updateGroupUserSpy.calls.reset();
    removeEntrySpy.calls.reset();
    updateEntrySpy.calls.reset();
    removeScheduleSpy.calls.reset();
    updateScheduleSpy.calls.reset();
    storageChildSpy.calls.reset();
    deleteFileSpy.calls.reset();

    schedule = {
      programTitle: 'My Schedule',
      startDate: '2016-12-27T07:00:00.000Z',
      program: 'PROG1',
      endDate: '2017-03-27T05:59:59.999Z',
      points: 30,
      pointsPossible: 195,
    };

    TestBed.configureTestingModule({
      providers: [ScheduleService,
        { provide: AngularFire, useValue: mockAngularFire },
        { provide: FirebaseApp, useValue: mockFirebase },
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


  describe('create', () => {
    const newSchedule = {
      program: 'PROG1',
      programTitle: 'Program One',
      startDate: '2016-12-27T07:00:00.000Z',
      imageUrl: 'assets/logo-noback.png',
      tasks: {
        BOFM90: 'daily',
        FASTING: 'monthly',
        GC: 'Mo,Th',
      }
    };

    it('should create a schedule', fakeAsync(() => {
      service.create('U1', newSchedule);
      tick();
      expect(pushSpy).toHaveBeenCalledWith({
        programTitle: 'Program One',
        startDate: '2016-12-27T07:00:00.000Z',
        program: 'PROG1',
        endDate: '2017-03-27T05:59:59.999Z',
        imageUrl: 'assets/logo-noback.png',
        points: 0,
        pointsPossible: 195,
        tasks: {
          BOFM90: 'daily',
          FASTING: 'monthly',
          GC: 'Mo,Th'
        }
      });
    }));

    it('should create schedule entries', fakeAsync(() => {
      service.create('U1', newSchedule);
      tick();
      expect(setSpy).toHaveBeenCalled();
      const entries = setSpy.calls.mostRecent().args[0];
      expect(_.keys(entries.daily).length).toBe(90);
      expect(entries.daily['2016-12-27']).toEqual({
        BOFM90: { order: 0, points: 1, finished: false }
      });
      expect(entries.daily['2016-12-28']).toEqual({
        BOFM90: { order: 1, points: 1, finished: false }
      });
      expect(entries.daily['2016-12-29']).toEqual({
        BOFM90: { order: 2, points: 1, finished: false },
        GC: { points: 1, finished: false }
      });
      expect(_.keys(entries.monthly)).toEqual(['2016-12', '2017-01', '2017-02', '2017-03']);
      expect(entries.monthly['2016-12']).toEqual({
        FASTING: { points: 20, finished: false }
      });
    }));

    it('should resolve with the new schedule id', fakeAsync(() => {
      service.create('U1', newSchedule).then((result) => {
        expect(result).toBe('NEWSCHED');
      });
      tick();
    }));
  });


  describe('delete', () => {
    it('should remove the entries', fakeAsync(() => {
      service.delete('U1', 'S1');
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/entries/S1');
      expect(removeEntrySpy).toHaveBeenCalled();
    }));

    it('should remove the schedule', fakeAsync(() => {
      service.delete('U1', 'S1');
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/schedules/U1/S1');
      expect(removeScheduleSpy).toHaveBeenCalled();
    }));

    it('should remove the schedule from a group', fakeAsync(() => {
      schedule.group = 'G1';
      service.delete('U1', 'S1');
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/groupUsers/G1/U1');
      expect(setGroupUserSpy).toHaveBeenCalledWith({
        displayName: 'John Doe'
      });
    }));

    it('should delete the schedule image', fakeAsync(() => {
      service.delete('U1', 'S1');
      tick();
      expect(storageChildSpy).toHaveBeenCalledWith('user/U1/S1/thumbnail.png');
      expect(deleteFileSpy).toHaveBeenCalled();
    }));
  });

  describe('update', () => {

    it('should update the schedule', () => {
      service.update('U1', 'S1', {
        imageUrl: 'assets/logo-noback.png'
      });
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/schedules/U1/S1');
      expect(updateScheduleSpy).toHaveBeenCalledWith({
        imageUrl: 'assets/logo-noback.png'
      });
    });

  });

  describe('updateEntry', () => {

    it('should check a daily entry', fakeAsync(() => {
      service.updateEntry('U1', 'S1', 'daily', '2016-12-27T07:00:00.000Z', 'BOFM90', 1, true);
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/entries/S1/daily/2016-12-27/BOFM90');
      expect(updateEntrySpy).toHaveBeenCalledWith({finished: true});
      expect(updateScheduleSpy).toHaveBeenCalledWith({points: 31});
    }));

    it('should uncheck a daily entry', fakeAsync(() => {
      service.updateEntry('U1', 'S1', 'daily', '2016-12-27T07:00:00.000Z', 'BOFM90', 1, false);
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/entries/S1/daily/2016-12-27/BOFM90');
      expect(updateEntrySpy).toHaveBeenCalledWith({finished: false});
      expect(updateScheduleSpy).toHaveBeenCalledWith({points: 29});
    }));

    it('should check a monthly entry', fakeAsync(() => {
      service.updateEntry('U1', 'S1', 'monthly', '2016-12-27T07:00:00.000Z', 'FASTING', 20, true);
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/entries/S1/monthly/2016-12/FASTING');
      expect(updateEntrySpy).toHaveBeenCalledWith({finished: true});
      expect(updateScheduleSpy).toHaveBeenCalledWith({points: 50});
    }));

    it('should uncheck a monthly entry', fakeAsync(() => {
      service.updateEntry('U1', 'S1', 'monthly', '2016-12-27T07:00:00.000Z', 'FASTING', 20, false);
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/entries/S1/monthly/2016-12/FASTING');
      expect(updateEntrySpy).toHaveBeenCalledWith({finished: false});
      expect(updateScheduleSpy).toHaveBeenCalledWith({points: 10});
    }));

    it('should update points for the group', fakeAsync(() => {
      schedule.group = 'G1';
      service.updateEntry('U1', 'S1', 'daily', '2016-12-27T07:00:00.000Z', 'BOFM90', 1, true);
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/groupUsers/G1/U1');
      expect(updateGroupUserSpy).toHaveBeenCalledWith({points: 31});
    }));

  });


});
