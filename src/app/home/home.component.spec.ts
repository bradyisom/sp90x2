/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule, MdDialog } from '@angular/material';
import { AngularFire } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { HomeComponent } from './home.component';
import { AuthService } from '../auth.service';
import { ConfirmService } from '../confirm.service';

describe('Component: Home', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let schedules = [];
  let schedule = {};

  const scheduleRemove = jasmine.createSpy('scheduleRemove', () => Promise.resolve()).and.callThrough();
  const mockAngularFire = {
    database: {
      list: jasmine.createSpy('list', () => {
        const result = Observable.of(schedules);
        (<any>result).remove = () => {};
        return result;
      }).and.callThrough(),
      object: jasmine.createSpy('object', () => {
        const result = Observable.of(schedule);
        (<any>result).remove = scheduleRemove;
        return result;
      }).and.callThrough()
    }
  };

  let dialogResult = 'confirm';
  const mockConfirm = {
    show: jasmine.createSpy('show', () => {
      return { afterClosed: () => Observable.of(dialogResult) };
    }).and.callThrough()
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

    mockAngularFire.database.list.calls.reset();
    mockAngularFire.database.object.calls.reset();
    scheduleRemove.calls.reset();
    mockConfirm.show.calls.reset();
  });

  describe('init logged in', () => {
    const mockAuthService: any = {
      user: Observable.of({
        uid: 'U1'
      })
    };

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          MaterialModule.forRoot(),
          RouterTestingModule.withRoutes([])
        ],
        providers: [
          { provide: AuthService, useValue: mockAuthService },
          { provide: AngularFire, useValue: mockAngularFire },
          { provide: ConfirmService, useValue: mockConfirm },
        ],
        declarations: [ HomeComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set the user', () => {
      component.user.subscribe((user) => {
        expect(user.uid).toBe('U1');
      });
    });

    it('should get the list of schedules', () => {
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/schedules/U1', {
        query: {
          orderByChild: 'startDate'
        }
      });
    });

    it('should get reverse order the list of schedules', () => {
      component.list.subscribe((list) => {
        expect(list).toEqual([{
          $key: 'S2',
          startDate: '2016-12-24',
          title: 'Two'
        }, {
          $key: 'S1',
          startDate: '2016-12-20',
          title: 'One'
        }]);
      });
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

      it('should remove the entry', () => {
        component.removeSchedule(schedules[0]);
        expect(mockAngularFire.database.object).toHaveBeenCalledWith('/entries/S1');
        expect(scheduleRemove).toHaveBeenCalled();
      });

      it('should not remove the entry', () => {
        dialogResult = 'cancel';
        component.removeSchedule(schedules[0]);
        expect(scheduleRemove).not.toHaveBeenCalled();
      });

    });

  });

  describe('init not logged in', () => {
    const mockAuthService: any = {
      user: Observable.of(null)
    };

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          MaterialModule.forRoot(),
          RouterTestingModule.withRoutes([])
        ],
        providers: [
          { provide: AuthService, useValue: mockAuthService },
          { provide: AngularFire, useValue: mockAngularFire },
          { provide: ConfirmService, useValue: mockConfirm },
        ],
        declarations: [ HomeComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set the user', () => {
      component.user.subscribe((user) => {
        expect(user).toBeNull();
      });
    });

    it('should set the list', () => {
      expect(component.list).toBeNull();
    });
  });

});
