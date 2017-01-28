/* tslint:disable:no-unused-variable */
import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseApp } from 'angularfire2';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { GroupService, Group } from '../models/group.service';
import { ScheduleService } from '../models/schedule.service';
import { ErrorService } from '../error.service';
import { ConfirmService } from '../confirm.service';

import { EditGroupComponent } from './edit-group.component';

import * as _ from 'lodash';

describe('EditGroupComponent', () => {
  let component: EditGroupComponent;
  let fixture: ComponentFixture<EditGroupComponent>;

  let router: Router;

  let rejectGroup: boolean;

  const mockGroups = {
    update: jasmine.createSpy('update', () => {
      if (rejectGroup) {
        return Promise.reject('Save group error');
      }
      return Promise.resolve({});
    }).and.callThrough(),
    create: jasmine.createSpy('create', () => {
      if (rejectGroup) {
        return Promise.reject('Save group error');
      }
      return Promise.resolve({});
    }).and.callThrough(),
    delete: jasmine.createSpy('delete', () => {
      if (rejectGroup) {
        return Promise.reject('Delete group error');
      }
      return Promise.resolve({});
    }).and.callThrough(),
    get: jasmine.createSpy('get', () => {
      return Observable.of({
        name: 'Group One',
        description: 'First group',
        owner: 'U1',
        imageUrl: 'assets/logo-noback.png',
        schedule: 'SCHED1',
      });
    }).and.callThrough(),
  };

  const mockSchedules = {
    listSchedules: jasmine.createSpy('listSchedules', () => {
      return Observable.of([{
        $key: 'SCHED1',
        programTitle: 'My Schedule',
        startDate: '2016-12-27T07:00:00.000Z',
        program: 'PROG1',
        endDate: '2017-03-27T05:59:59.999Z',
        points: 0,
        pointsPossible: 195,
        tasks: {
          BOFM90: 'daily',
          FASTING: 'monthly',
          GC: 'Mo,Th'
        }
      }, {
        $key: 'SCHED2'
      }]);
    }).and.callThrough(),
  };

  const mockError = {
    show: jasmine.createSpy('show error', () => {}).and.callThrough(),
  };

  let confirmResult: string;

  const mockConfirm = {
    show: jasmine.createSpy('show confirm', () => {
      return {
        afterClosed: () => Observable.of(confirmResult)
      };
    }).and.callThrough(),
  };

  const storageChildSpy = jasmine.createSpy('storage ref', () => {
    return {
      getDownloadURL: () => {
        return Promise.resolve('assets/logo-noback.png');
      }
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        MaterialModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: GroupService, useValue: mockGroups },
        { provide: ScheduleService, useValue: mockSchedules },
        { provide: ErrorService, useValue: mockError },
        { provide: ConfirmService, useValue: mockConfirm },
        { provide: FirebaseApp, useValue: mockFirebase },
      ],
      declarations: [ EditGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mockSchedules.listSchedules.calls.reset();
    mockGroups.create.calls.reset();
    mockGroups.get.calls.reset();
    mockGroups.update.calls.reset();
    mockGroups.delete.calls.reset();
    mockError.show.calls.reset();
    mockConfirm.show.calls.reset();
    storageChildSpy.calls.reset();

    rejectGroup = false;
    confirmResult = 'confirm';

    router = TestBed.get(Router);
    spyOn(router, 'navigate').and.callFake(() => {});
  });


  describe('existing group', () => {

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

      fixture = TestBed.createComponent(EditGroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set groupId', () => {
      expect(component.groupId).toBe('G1');
    });

    it('should setup edit form', () => {
      expect(component.editForm.getRawValue()).toEqual({
        name: 'Group One',
        description: 'First group',
        schedule: 'SCHED1',
      });
    });

    it('should list schedules', () => {
      expect(mockSchedules.listSchedules).toHaveBeenCalledWith('U1');
      component.schedules.first().subscribe((list) => {
        expect(_.map(list, (s: any) => s.$key)).toEqual(['SCHED1', 'SCHED2']);
      });
    });

    it('should not get a new image', () => {
      expect(storageChildSpy).not.toHaveBeenCalled();
    });


    describe('save', () => {

      it('should update the group', () => {
        component.save();
        expect(mockGroups.create).not.toHaveBeenCalled();
        expect(mockGroups.update).toHaveBeenCalledWith('G1', {
          name: 'Group One',
          description: 'First group',
          public: true,
          owner: 'U1',
          imageUrl: 'assets/logo-noback.png',
          schedule: 'SCHED1',
          startDate: '2016-12-27T07:00:00.000Z',
          endDate: '2017-03-27T05:59:59.999Z',
          programTitle: 'My Schedule',
          program: 'PROG1',
          tasks: {
            BOFM90: 'daily',
            FASTING: 'monthly',
            GC: 'Mo,Th'
          }
        });
      });

      it('should navigate back to groups', fakeAsync(() => {
        component.save();
        tick();
        expect(router.navigate).toHaveBeenCalledWith(['/groups']);
      }));

      it('should show an error on failure', fakeAsync(() => {
        rejectGroup = true;
        component.save();
        tick();
        expect(mockError.show).toHaveBeenCalledWith(
          'Save group error',
          'Unable to save group'
        );
      }));


    });

    describe('cancel', () => {

      it('should navigate back to groups', () => {
        component.cancel();
        expect(router.navigate).toHaveBeenCalledWith(['/groups']);
      });

    });


    describe('delete', () => {

      it('should prompt', () => {
        component.delete();
        expect(mockConfirm.show).toHaveBeenCalledWith(
          'Are you sure you want to delete the \'Group One\' group?',
          'Delete Group',
          'warn'
        );
      });

      it('should delete the group', fakeAsync(() => {
        component.delete();
        tick();
        expect(mockGroups.delete).toHaveBeenCalledWith('G1');
      }));

      it('should navigate back to groups', fakeAsync(() => {
        component.delete();
        tick();
        expect(router.navigate).toHaveBeenCalledWith(['/groups']);
      }));

      it('should not delete the group', fakeAsync(() => {
        confirmResult = '';
        component.delete();
        tick();
        expect(mockGroups.delete).not.toHaveBeenCalled();
      }));

      it('should show an error', fakeAsync(() => {
        rejectGroup = true;
        component.delete();
        tick();
        expect(mockError.show).toHaveBeenCalledWith(
          'Delete group error',
          'Unable to delete group'
        );
      }));

    });


  });

  describe('new group', () => {

    beforeEach(() => {
      const route = TestBed.get(ActivatedRoute);
      route.snapshot.data = {
        user: {
          uid: 'U1'
        }
      };
      route.snapshot.params = {};

      fixture = TestBed.createComponent(EditGroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set groupId', () => {
      expect(component.groupId).toBeUndefined();
    });

    it('should setup edit form', () => {
      expect(component.editForm.getRawValue()).toEqual({
        name: '',
        description: '',
        schedule: null,
      });
    });

    it('should get a new image', () => {
      expect(storageChildSpy).toHaveBeenCalled();
      const arg = storageChildSpy.calls.mostRecent().args[0];
      expect(arg).toMatch(/app-images\/abstract[0-9]{1,2}\.jpg/);
    });


    describe('save', () => {

      it('should noop with invalid form', () => {
        component.save();
        expect(mockGroups.create).not.toHaveBeenCalled();
        expect(mockGroups.update).not.toHaveBeenCalled();
      });

      it('should create the group', fakeAsync(() => {
        component.editForm.setValue({
          name: 'New Group',
          description: 'Another group',
          schedule: 'SCHED1',
        });
        tick();
        fixture.detectChanges();
        component.save();
        expect(mockGroups.update).not.toHaveBeenCalled();
        expect(mockGroups.create).toHaveBeenCalledWith({
          name: 'New Group',
          description: 'Another group',
          public: true,
          owner: 'U1',
          imageUrl: undefined, // 'assets/logo-noback.png',
          schedule: 'SCHED1',
          startDate: '2016-12-27T07:00:00.000Z',
          endDate: '2017-03-27T05:59:59.999Z',
          programTitle: 'My Schedule',
          program: 'PROG1',
          tasks: {
            BOFM90: 'daily',
            FASTING: 'monthly',
            GC: 'Mo,Th'
          }
        }, {
          uid: 'U1'
        });
      }));

      it('should navigate back to groups', fakeAsync(() => {
        component.editForm.setValue({
          name: 'New Group',
          description: 'Another group',
          schedule: 'SCHED1',
        });
        component.save();
        tick();
        expect(router.navigate).toHaveBeenCalledWith(['/groups']);
      }));


      it('should show an error on failure', fakeAsync(() => {
        rejectGroup = true;
        component.editForm.setValue({
          name: 'New Group',
          description: 'Another group',
          schedule: 'SCHED1',
        });
        component.save();
        tick();
        expect(mockError.show).toHaveBeenCalledWith(
          'Save group error',
          'Unable to save group'
        );
      }));

    });

  });

  describe('new group with schedule', () => {

    beforeEach(() => {
      const route = TestBed.get(ActivatedRoute);
      route.snapshot.data = {
        user: {
          uid: 'U1'
        }
      };
      route.snapshot.params = {};
      route.snapshot.queryParams = {
        scheduleId: 'SCHED1'
      };

      fixture = TestBed.createComponent(EditGroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should setup edit form', () => {
      expect(component.editForm.getRawValue()).toEqual({
        name: '',
        description: '',
        schedule: 'SCHED1',
      });
    });
  });
});
