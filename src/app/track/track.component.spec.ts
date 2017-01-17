/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '@angular/material';
import { AngularFire } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { ScheduleService } from '../models/schedule.service';
import { TrackComponent } from './track.component';

import * as moment from 'moment';

describe('Component: TrackComponent', () => {

  let component: TrackComponent;
  let fixture: ComponentFixture<TrackComponent>;

  let router: Router;
  let route: ActivatedRoute;

  let schedule: any;
  let dailyEntries: any[];
  let monthlyEntries: any[];

  const updateSpy = jasmine.createSpy('update');
  const updateScheduleSpy = jasmine.createSpy('update schedule');
  const mockAngularFire = {
    database: {
      list: jasmine.createSpy('list', (path: string) =>  {
        let result: Observable<any[]>;
        if (path.indexOf('/daily/') !== -1) {
          result = Observable.of(dailyEntries);
        } else if (path.indexOf('/monthly/') !== -1) {
          result = Observable.of(monthlyEntries);
        } else {
          result = Observable.of([]);
        }
        (<any>result).update = updateSpy;
        return result;
      }).and.callThrough(),
      object: jasmine.createSpy('object', (path: string) => {
        if (path.startsWith('/schedule')) {
          const result = Observable.of(schedule);
          (<any>result).update = updateScheduleSpy;
          return result;
        }
        return Observable.of({});
      }).and.callThrough()
    }
  };

  const mockSchedule = {
    updateEntry: jasmine.createSpy('updateEntry', () => {
      return Promise.resolve();
    }).and.callThrough(),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule.forRoot(),
        RouterTestingModule.withRoutes([{
          path: 'track/:scheduleId/:date',
          component: TrackComponent
        }]),
      ],
      providers: [
        { provide: AngularFire, useValue: mockAngularFire },
        { provide: ScheduleService, useValue: mockSchedule },
      ],
      declarations: [ TrackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mockAngularFire.database.list.calls.reset();
    mockAngularFire.database.object.calls.reset();
    updateScheduleSpy.calls.reset();
    updateSpy.calls.reset();

    router = TestBed.get(Router);
    spyOn(router, 'navigate').and.callFake(() => {});
    route = TestBed.get(ActivatedRoute);
    route.snapshot.data = {
      user: {
        uid: 'U1'
      }
    };

    schedule = {
      programTitle: 'My Schedule',
      startDate: '2016-12-27T07:00:00.000Z',
      program: 'PROG1',
      endDate: '2017-03-27T05:59:59.999Z',
      points: 30,
      pointsPossible: 195,
    };

    dailyEntries = [{
      $key: 'BOFM90',
      order: 1,
      points: 1,
      finished: false
    }, {
      $key: 'PONDER',
      points: 1,
      finished: false
    }];

    monthlyEntries = [{
      $key: 'FASTING',
      points: 20,
      finished: false
    }];
  });

  describe('without date', () => {
    beforeEach(() => {
      route.params = Observable.of({
        scheduleId: 'SCHED1'
      });
      fixture = TestBed.createComponent(TrackComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should navigate to today', () => {
      expect(router.navigate).toHaveBeenCalledWith([
        '/track', 'SCHED1', moment().format('YYYY-MM-DD')
      ], {
        replaceUrl: true
      });
    });
  });

  describe('before start date', () => {
    beforeEach(() => {
      route.params = Observable.of({
        scheduleId: 'SCHED1',
        date: '2016-12-26'
      });
      fixture = TestBed.createComponent(TrackComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should navigate to first day', () => {
      expect(router.navigate).toHaveBeenCalledWith([
        '/track', 'SCHED1', '2016-12-27'
      ], {
        replaceUrl: true
      });
    });
  });

  describe('after end date', () => {
    beforeEach(() => {
      route.params = Observable.of({
        scheduleId: 'SCHED1',
        date: '2017-03-28'
      });
      fixture = TestBed.createComponent(TrackComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should navigate to last day', () => {
      expect(router.navigate).toHaveBeenCalledWith([
        '/track', 'SCHED1', '2017-03-26'
      ], {
        replaceUrl: true
      });
    });
  });

  describe('first day', () => {
    beforeEach(() => {
      route.params = Observable.of({
        scheduleId: 'SCHED1',
        date: '2016-12-27'
      });
      fixture = TestBed.createComponent(TrackComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set the program day', () => {
      expect(component.date.toISOString()).toBe('2016-12-27T07:00:00.000Z');
      expect(component.programDay).toBe(1);
    });

    it('should load the schedule', () => {
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/schedules/U1/SCHED1');
      component.schedule.subscribe((obj) => {
        expect(obj).toEqual(schedule);
      });
    });

    it('should load the fit test', () => {
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/entries/SCHED1/fitTest/2016-12-27');
      component.fitTest.subscribe((fitTest) => {
        expect(fitTest).toEqual({});
      });
    });

    it('should load the daily entries', () => {
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/entries/SCHED1/daily/2016-12-27');
      component.dailyEntries.subscribe((entries) => {
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/tasks/BOFM90');
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/subTasks/BOFM90/1');
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/tasks/PONDER');
        expect(entries).toEqual([{
          $key: 'BOFM90',
          order: 1,
          points: 1,
          finished: false,
          details: jasmine.any(Object),
          subtaskDetails: jasmine.any(Object)
        }, {
          $key: 'PONDER',
          points: 1,
          finished: false,
          details: jasmine.any(Object),
        }]);
      });
    });

    it('should load the monthly entries', () => {
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/entries/SCHED1/monthly/2016-12');
      component.monthlyEntries.subscribe((entries) => {
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/tasks/FASTING');
        expect(entries).toEqual([{
          $key: 'FASTING',
          points: 20,
          finished: false,
          details: jasmine.any(Object),
        }]);
      });
    });


    describe('taskKey', () => {
      it('should return empty for no task', () => {
        expect(component.taskKey(null)).toBe('');
      });

      it('should return the task key', () => {
        expect(component.taskKey({
          $key: 'TASK1'
        })).toBe('TASK1');
      });
    });

    describe('showFitTest', () => {
      it('should return true for days 1, 30, 60 and 90', () => {
        const days = [1, 30, 60, 90];
        for (const day of days) {
          component.programDay = day;
          expect(component.showFitTest()).toBe(true);
        }
      });
      it('should return false for other days', () => {
        const days = [2, 29, 31, 59, 61, 89];
        for (const day of days) {
          component.programDay = day;
          expect(component.showFitTest()).toBe(false);
        }
      });
    });

    describe('getDay', () => {
      it('should format the day', () => {
        expect(component.getDay()).toBe('2016-12-27');
      });
    });

    describe('checkEntry', () => {
      it('should check a daily entry', () => {
        component.checkEntry('daily', {
          $key: 'BOFM90',
          points: 1
        }, true);
        expect(mockSchedule.updateEntry).toHaveBeenCalledWith(
          'U1', 'SCHED1', 'daily', '2016-12-27T07:00:00.000Z', 'BOFM90', 1, true
        );
      });

      it('should uncheck a daily entry', () => {
        component.checkEntry('daily', {
          $key: 'BOFM90',
          points: 1
        }, false);
        expect(mockSchedule.updateEntry).toHaveBeenCalledWith(
          'U1', 'SCHED1', 'daily', '2016-12-27T07:00:00.000Z', 'BOFM90', 1, false
        );
      });

      it('should check a monthly entry', () => {
        component.checkEntry('monthly', {
          $key: 'FASTING',
          points: 20
        }, true);
        expect(mockSchedule.updateEntry).toHaveBeenCalledWith(
          'U1', 'SCHED1', 'monthly', '2016-12-27T07:00:00.000Z', 'FASTING', 20, true
        );
      });

      it('should uncheck a monthly entry', () => {
        component.checkEntry('monthly', {
          $key: 'FASTING',
          points: 20
        }, false);
        expect(mockSchedule.updateEntry).toHaveBeenCalledWith(
          'U1', 'SCHED1', 'monthly', '2016-12-27T07:00:00.000Z', 'FASTING', 20, false
        );
      });
    });
  });


  describe('second day', () => {
    beforeEach(() => {
      route.params = Observable.of({
        scheduleId: 'SCHED1',
        date: '2016-12-28'
      });
      fixture = TestBed.createComponent(TrackComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set the program day', () => {
      expect(component.date.toISOString()).toBe('2016-12-28T07:00:00.000Z');
      expect(component.programDay).toBe(2);
    });

    it('should not load the fit test', () => {
      expect(mockAngularFire.database.object).not.toHaveBeenCalledWith('/entries/SCHED1/fitTest/2016-12-28');
      expect(component.fitTest).toBeFalsy();
    });

    it('should load the daily entries', () => {
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/entries/SCHED1/daily/2016-12-28');
      component.dailyEntries.subscribe((entries) => {
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/tasks/BOFM90');
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/subTasks/BOFM90/1');
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/tasks/PONDER');
        expect(entries).toEqual([{
          $key: 'BOFM90',
          order: 1,
          points: 1,
          finished: false,
          details: jasmine.any(Object),
          subtaskDetails: jasmine.any(Object)
        }, {
          $key: 'PONDER',
          points: 1,
          finished: false,
          details: jasmine.any(Object),
        }]);
      });
    });

    it('should load the monthly entries', () => {
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/entries/SCHED1/monthly/2016-12');
      component.monthlyEntries.subscribe((entries) => {
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/tasks/FASTING');
        expect(entries).toEqual([{
          $key: 'FASTING',
          points: 20,
          finished: false,
          details: jasmine.any(Object),
        }]);
      });
    });


    describe('moveDay', () => {
      it('should go forward', () => {
        component.moveDay(1);
        expect(router.navigate).toHaveBeenCalledWith(['..', '2016-12-29'], {
          relativeTo: route
        });
        expect(component.date.toISOString()).toBe('2016-12-29T07:00:00.000Z');
        expect(mockAngularFire.database.list).toHaveBeenCalledWith('/entries/SCHED1/daily/2016-12-29');
      });

      it('should go backward', () => {
        component.moveDay(-1);
        expect(router.navigate).toHaveBeenCalledWith(['..', '2016-12-27'], {
          relativeTo: route
        });
        expect(component.date.toISOString()).toBe('2016-12-27T07:00:00.000Z');
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/entries/SCHED1/fitTest/2016-12-27');
        expect(mockAngularFire.database.list).toHaveBeenCalledWith('/entries/SCHED1/daily/2016-12-27');
      });
    });

  });

});
