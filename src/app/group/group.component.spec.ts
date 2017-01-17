/* tslint:disable:no-unused-variable */
import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import { GroupService, Group } from '../models/group.service';
import { ScheduleService } from '../models/schedule.service';
import { ErrorService } from '../error.service';

import { GroupComponent } from './group.component';

import * as _ from 'lodash';

describe('GroupComponent', () => {
  let component: GroupComponent;
  let fixture: ComponentFixture<GroupComponent>;

  let rejectMethod: boolean;

  const mockSchedules = {
    create: jasmine.createSpy('create schedule', () => {
      if (rejectMethod) {
        return Promise.reject('Error creating schedule');
      }
      return Promise.resolve('NEWSCHEDULE');
    }).and.callThrough(),
  };

  const mockError = {
    show: jasmine.createSpy('error', () => {}).and.callThrough(),
  };

  const mockGroups = {
    join: jasmine.createSpy('join', () => {
      if (rejectMethod) {
        return Promise.reject('Error joining');
      }
      return Promise.resolve();
    }).and.callThrough(),
    leave: jasmine.createSpy('leave', () => {
      if (rejectMethod) {
        return Promise.reject('Error leaving');
      }
      return Promise.resolve();
    }).and.callThrough(),
    get: jasmine.createSpy('get', () => {
      return Observable.of({
        name: 'Group One',
        owner: 'U1',
        imageUrl: 'assets/logo-noback.png',
        startDate: '2017-01-16T07:00:00Z',
        program: 'CLASSIC-M',
        tasks: {
          BOFM: 'daily',
          FASTING: 'monthly',
        }
      });
    }).and.callThrough(),
    listGroupMembers: jasmine.createSpy('listGroupMembers', () => {
      return Observable.of([{
        $key: 'U1',
        displayName: 'John Doe',
        avatar: 'assets/logo-noback.png',
      }, {
        $key: 'U2',
        displayName: 'Jane Dole',
        avatar: 'assets/logo-noback.png',
      }]);
    }).and.callThrough(),
    setSchedule: jasmine.createSpy('setSchedule', () => {
      return Promise.resolve();
    }).and.callThrough(),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        MaterialModule.forRoot(),
      ],
      providers: [
        { provide: GroupService, useValue: mockGroups },
        { provide: ScheduleService, useValue: mockSchedules },
        { provide: ErrorService, useValue: mockError },
      ],
      declarations: [ GroupComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mockGroups.get.calls.reset();
    mockGroups.listGroupMembers.calls.reset();
    mockGroups.join.calls.reset();
    mockGroups.leave.calls.reset();
    mockGroups.setSchedule.calls.reset();
    mockSchedules.create.calls.reset();
    mockError.show.calls.reset();

    rejectMethod = false;
  });


  describe('owner', () => {
    beforeEach(() => {
      const route = TestBed.get(ActivatedRoute);
      route.snapshot.data = {
        user: {
          uid: 'U1'
        }
      };
      route.snapshot.params = {
        id: 'G1',
      };

      fixture = TestBed.createComponent(GroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should get the group', () => {
      expect(mockGroups.get).toHaveBeenCalledWith('G1');
      component.group.first().subscribe((g) => {
        expect(g.name).toBe('Group One');
      });
    });

    it('should get the group members', () => {
      expect(mockGroups.listGroupMembers).toHaveBeenCalledWith('G1');
      component.members.first().subscribe((members) => {
        expect(_.map(members, (m: any) => m.displayName)).toEqual([
          'John Doe',
          'Jane Dole',
        ]);
      });
    });

    it('should set isMember to true', fakeAsync(() => {
      expect(component.isMember.value).toBe(true);
    }));

    it('should set isOwner to true', fakeAsync(() => {
      expect(component.isOwner.value).toBe(true);
    }));

  });

  describe('member', () => {
    beforeEach(() => {
      const route = TestBed.get(ActivatedRoute);
      route.snapshot.data = {
        user: {
          uid: 'U2'
        }
      };
      route.snapshot.params = {
        id: 'G1',
      };

      fixture = TestBed.createComponent(GroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set isMember to true', fakeAsync(() => {
      expect(component.isMember.value).toBe(true);
    }));

    it('should set isOwner to false', fakeAsync(() => {
      expect(component.isOwner.value).toBe(false);
    }));

    describe('leave', () => {

      it('should leave the group', () => {
        component.leave();
        expect(mockGroups.leave).toHaveBeenCalledWith('U2', 'G1');
      });

      it('should show an error', fakeAsync(() => {
        rejectMethod = true;
        component.leave();
        tick();
        expect(mockError.show).toHaveBeenCalledWith(
          'Error leaving', 'Unable to leave group'
        );
      }));

    });


    describe('createSchedule', () => {

      it('should create the schedule', () => {
        component.createSchedule();
        expect(mockSchedules.create).toHaveBeenCalledWith('U2', {
          programTitle: 'Group One',
          program: 'CLASSIC-M',
          startDate: '2017-01-16T07:00:00Z',
          group: 'G1',
          tasks: {
            BOFM: 'daily',
            FASTING: 'monthly'
          },
        });
      });

      it('should attach the schedule to the group', fakeAsync(() => {
        component.createSchedule();
        tick();
        expect(mockGroups.setSchedule).toHaveBeenCalledWith('U2', 'G1', 'NEWSCHEDULE');
      }));

      it('should show an error', fakeAsync(() => {
        rejectMethod = true;
        component.createSchedule();
        tick();
        expect(mockError.show).toHaveBeenCalledWith(
          'Error creating schedule', 'Unable to create schedule'
        );
      }));
    });


  });

  describe('not member', () => {
    beforeEach(() => {
      const route = TestBed.get(ActivatedRoute);
      route.snapshot.data = {
        user: {
          uid: 'U3'
        }
      };
      route.snapshot.params = {
        id: 'G1',
      };

      fixture = TestBed.createComponent(GroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set isMember to false', fakeAsync(() => {
      expect(component.isMember.value).toBe(false);
    }));

    it('should set isOwner to false', fakeAsync(() => {
      expect(component.isOwner.value).toBe(false);
    }));


    describe('join', () => {

      it('should join the group', () => {
        component.join();
        expect(mockGroups.join).toHaveBeenCalledWith({
          uid: 'U3'
        }, 'G1');
      });

      it('should show an error', fakeAsync(() => {
        rejectMethod = true;
        component.join();
        tick();
        expect(mockError.show).toHaveBeenCalledWith(
          'Error joining', 'Unable to join group'
        );
      }));

    });


  });


});
