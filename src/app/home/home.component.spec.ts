/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule, MdDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HomeComponent } from './home.component';
import { AuthService } from '../auth.service';
import { ConfirmService } from '../confirm.service';
import { WindowSizeService } from '../window-size.service';
import { ScheduleService } from '../models/schedule.service';

describe('Component: Home', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let schedules = [];
  let schedule = {};

  let route: ActivatedRoute;

  const mockSchedule = {
    listSchedules: jasmine.createSpy('listSchedules', () => {
      return Observable.of(schedules);
    }).and.callThrough(),
    delete: jasmine.createSpy('delete', () => {
      return Promise.resolve();
    }).and.callThrough()
  };

  let dialogResult = 'confirm';
  const mockConfirm = {
    show: jasmine.createSpy('show', () => {
      return { afterClosed: () => Observable.of(dialogResult) };
    }).and.callThrough()
  };

  const mockWindowSize = {
    gridColumnCount: new BehaviorSubject<number>(3)
  };

  beforeEach(() => {
    schedules = [{
      $key: 'S1',
      startDate: '2016-12-20',
      title: 'One'
    }, {
      $key: 'S2',
      startDate: '2016-12-24',
      title: 'Two'
    }];
    schedule = {};

    mockSchedule.listSchedules.calls.reset();
    mockSchedule.delete.calls.reset();
    mockConfirm.show.calls.reset();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule.forRoot(),
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: ScheduleService, useValue: mockSchedule },
        { provide: ConfirmService, useValue: mockConfirm },
        { provide: WindowSizeService, useValue: mockWindowSize },
      ],
      declarations: [ HomeComponent ]
    });

    route = TestBed.get(ActivatedRoute);
    route.snapshot.data = {
      user: {
        uid: 'U1'
      }
    };

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the user', () => {
    expect(component.user).toEqual({
      uid: 'U1'
    });
  });

  it('should get the list of schedules', () => {
    expect(mockSchedule.listSchedules).toHaveBeenCalledWith('U1');
  });

  describe('removeSchedule', () => {

    it('should confirm', () => {
      component.removeSchedule(schedules[0]);
      expect(mockConfirm.show).toHaveBeenCalledWith(
        `Are you sure you want to delete this schedule?`,
        'Delete',
        'warn'
      );
    });

    it('should remove the schedule', () => {
      component.removeSchedule(schedules[0]);
      expect(mockSchedule.delete).toHaveBeenCalledWith('U1', 'S1');
    });

    it('should not remove the schedule', () => {
      dialogResult = 'cancel';
      component.removeSchedule(schedules[0]);
      expect(mockSchedule.delete).not.toHaveBeenCalled();
    });

  });

});
