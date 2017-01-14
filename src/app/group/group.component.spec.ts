/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs/Observable';
import { GroupService, Group } from '../models/group.service';
import { ScheduleService } from '../models/schedule.service';

import { GroupComponent } from './group.component';

import * as _ from 'lodash';

describe('GroupComponent', () => {
  let component: GroupComponent;
  let fixture: ComponentFixture<GroupComponent>;

  const mockGroups = {
    listUserGroups: jasmine.createSpy('listUserGroups', () => {
      return Observable.of(['G1', 'G2']);
    }).and.callThrough(),
    join: jasmine.createSpy('join', () => {}).and.callThrough(),
    leave: jasmine.createSpy('leave', () => {}).and.callThrough(),
    get: jasmine.createSpy('get', () => {
      return Observable.of({
        name: 'Group One',
        owner: 'U1',
        imageUrl: 'assets/logo-noback.png',
      });
    }).and.callThrough(),
    listGroupMembers: jasmine.createSpy('listGroupMembers', () => {
      return Observable.of([{
        displayName: 'John Doe'
      }, {
        displayName: 'Jane Dole'
      }]);
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
      ],
      declarations: [ GroupComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mockGroups.get.calls.reset();
    mockGroups.listUserGroups.calls.reset();
    mockGroups.listGroupMembers.calls.reset();
    mockGroups.join.calls.reset();
    mockGroups.leave.calls.reset();
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

    it('should set isMember to true', () => {
      expect(component.isMember).toBe(true);
    });

    it('should set isOwner to true', () => {
      expect(component.isOwner).toBe(true);
    });

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

    it('should set isMember to true', () => {
      expect(component.isMember).toBe(true);
    });

    it('should set isOwner to false', () => {
      expect(component.isOwner).toBe(false);
    });

    describe('leave', () => {

      it('should leave the group', () => {
        component.leave();
        expect(mockGroups.leave).toHaveBeenCalledWith('U2', 'G1');
      });

    });

  });

  describe('not member', () => {
    beforeEach(() => {
      const route = TestBed.get(ActivatedRoute);
      route.snapshot.data = {
        user: {
          uid: 'U2'
        }
      };
      route.snapshot.params = {
        id: 'G3',
      };

      fixture = TestBed.createComponent(GroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set isMember to false', () => {
      expect(component.isMember).toBe(false);
    });

    it('should set isOwner to false', () => {
      expect(component.isOwner).toBe(false);
    });


    describe('join', () => {

      it('should join the group', () => {
        component.join();
        expect(mockGroups.join).toHaveBeenCalledWith({
          uid: 'U2'
        }, 'G3');
      });

    });


  });


});
