/* tslint:disable:no-unused-variable */
import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { Observable } from 'rxjs';
import { AngularFire } from 'angularfire2';
import { AuthService } from '../auth.service';

import { ProgressComponent } from './progress.component';

import * as _ from 'lodash';

describe('ProgressComponent', () => {
  let component: ProgressComponent;
  let fixture: ComponentFixture<ProgressComponent>;

  let fitTest: any[];
  let schedules: any[];
  let entries: any[];

  let mockAngularFire = {
    database: {
      list: jasmine.createSpy('list', (path: string) => {
        if (path === '/fitTest') {
          return Observable.of(fitTest);
        }
        if (path.startsWith('/schedules/')) {
          return Observable.of(schedules);
        }
        if (path.startsWith('/entries/')) {
          return Observable.of(entries);
        }
        return Observable.of([]);
      }).and.callThrough()
    }
  };

  let mockAuthService = {
    user: Observable.of({
      uid: 'U1'
    })
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule.forRoot(),
        ChartsModule
      ],
      providers: [
        { provide: AngularFire, useValue: mockAngularFire },
        { provide: AuthService, useValue: mockAuthService },
      ],
      declarations: [ProgressComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    mockAngularFire.database.list.calls.reset();

    fitTest = [{
      $key: 'FAITH',
      title: 'Faith',
      pointsPossible: 45
    }, {
      $key: 'HOPE',
      title: 'Hope',
      pointsPossible: 20
    }];

    schedules = [{
      $key: 'SCHED1',
    }, {
      $key: 'SCHED2'
    }];

    entries = [{
      $key: '2016-12-29',
      points: 32,
      pointsPossible: 65,
      groups: {
        FAITH: {
          points: 20,
          pointsPossible: 45
        },
        HOPE: {
          points: 12,
          pointsPossible: 20
        }
      }
    }, {
      $key: '2015-09-13',
      points: 30,
      pointsPossible: 65,
      groups: {
        FAITH: {
          points: 18,
          pointsPossible: 45
        },
        HOPE: {
          points: 12,
          pointsPossible: 20
        }
      }
    }];
  });

  it('should create', () => {
    fixture = TestBed.createComponent(ProgressComponent);
    component = fixture.componentInstance;
    expect(component.loaded).toBeFalsy();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('with data', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ProgressComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should load fit test data', () => {
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/fitTest');
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/schedules/U1', {
        query: {
          orderBy: 'startDate'
        }
      });
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/entries/SCHED1/fitTest');
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/entries/SCHED2/fitTest');
    });

    it('should load fit test charts', () => {
      expect(_.map(component.fitTestCharts, 'title')).toEqual([
        'Overall', 'Faith', 'Hope'
      ]);
    });

    it('should load fit test chart date labels', () => {
      expect(component.fitTestCharts[0].labels).toEqual([
        'Sep 13, 2015',
        'Dec 29, 2016'
      ]);
    });

    it('should load fit test chart colors', () => {
      expect(_.map(component.fitTestCharts, entry => {
       return entry.colors[0].backgroundColor;
      })).toEqual([
        'rgba(255,87,34,0.2)',
        'rgba(148,159,177,0.2)',
        'rgba(148,159,177,0.2)'
      ]);
    });

    it('should load fit test chart data', () => {
      expect(_.map(component.fitTestCharts, entry => {
       return entry.data[0].data;
      })).toEqual([
        [30, 32],
        [18, 20],
        [12, 12],
      ]);
    });

    it('should load chart step data', () => {
      expect(_.map(component.fitTestCharts, entry => {
       return entry.options.scales.yAxes[0].ticks;
      })).toEqual([
        jasmine.objectContaining({max: 300, stepSize: 60}),
        jasmine.objectContaining({max: 45, stepSize: 5}),
        jasmine.objectContaining({max: 20, stepSize: 5}),
      ]);
    });


    it('should render a custom tooltip', () => {
      expect(component.fitTestCharts[0].options.tooltips.callbacks.label({
        index: 1
      }, {
        datasets: [{
          data: [30, 32]
        }]
      })).toBe('Overall - 32 / 65');
    });

    it('should set loaded', () => {
      expect(component.loaded).toBeTruthy();
    });

  });

  describe('no schedules', () => {
    beforeEach(() => {
      schedules = [];
      fixture = TestBed.createComponent(ProgressComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should load data', () => {
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/fitTest');
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/schedules/U1', {
        query: {
          orderBy: 'startDate'
        }
      });
      expect(mockAngularFire.database.list).not.toHaveBeenCalledWith('/entries/SCHED1/fitTest');
      expect(mockAngularFire.database.list).not.toHaveBeenCalledWith('/entries/SCHED2/fitTest');
    });

    it('should set loaded', () => {
      expect(component.loaded).toBeTruthy();
    });

  });

  describe('no entries', () => {
    beforeEach(() => {
      entries = [];
      fixture = TestBed.createComponent(ProgressComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should load data', () => {
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/fitTest');
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/schedules/U1', {
        query: {
          orderBy: 'startDate'
        }
      });
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/entries/SCHED1/fitTest');
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/entries/SCHED2/fitTest');
      expect(component.fitTestCharts).toBeUndefined();
    });

    it('should set loaded', () => {
      expect(component.loaded).toBeTruthy();
    });
  });
});
