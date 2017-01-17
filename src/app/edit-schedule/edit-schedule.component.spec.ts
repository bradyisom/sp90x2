/* tslint:disable:no-unused-variable */

import { TestBed, async, fakeAsync, tick, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { AngularFire } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth.service';
import { ScheduleService } from '../models/schedule.service';
import { EditScheduleComponent } from './edit-schedule.component';

import * as _ from 'lodash';
import * as moment from 'moment';

describe('Component: EditSchedule', () => {

  let component: EditScheduleComponent;
  let fixture: ComponentFixture<EditScheduleComponent>;

  let programs: any[];
  let allTasks: any[];
  let programTasks: any[];
  let subTasks: any;

  const mockAuthService = {
    user: Observable.of({
      uid: 'U1'
    })
  };

  const mockSchedule = {
    create: jasmine.createSpy('create', () => {
      return Promise.resolve('SCHED1');
    }).and.callThrough(),
  };

  const pushSpy = jasmine.createSpy('push', () => {
    return Promise.resolve({
      key: 'SCHED1'
    });
  }).and.callThrough();

  const setSpy = jasmine.createSpy('set', (arg: any) => {
    return Promise.resolve({});
  }).and.callThrough();

  const mockAngularFire = {
    database: {
      list: jasmine.createSpy('list', (path: string) => {
        if (path.startsWith('/programs/') && path.endsWith('/tasks')) {
          return Observable.of(programTasks);
        }
        if (path === '/programs') {
          return Observable.of(programs);
        }
        if (path === '/tasks') {
          return Observable.of(allTasks);
        }
        const result = Observable.of([]);
        (<any>result).push = pushSpy;
        return result;
      }).and.callThrough(),
      object: jasmine.createSpy('object', (path: string) => {
        if (path === '/subTasks') {
          return Observable.of(subTasks);
        }
        const result = Observable.of({});
        (<any>result).set = setSpy;
        return result;
      }).and.callThrough()
    }
  };

  const mockRouter = {
    url: '',
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AngularFire, useValue: mockAngularFire },
        { provide: Router, useValue: mockRouter },
        { provide: ScheduleService, useValue: mockSchedule },
      ],
      declarations: [ EditScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mockAngularFire.database.list.calls.reset();
    mockAngularFire.database.object.calls.reset();
    mockSchedule.create.calls.reset();

    programs = [{
      $key: 'CLASSIC-M',
      title: 'SP90X - Men'
    }, {
      $key: 'CLASSIC-W',
      title: 'SP90X - Women'
    }];

    programTasks = [{
      $key: 'BOFM90',
      $value: 'daily'
    }, {
      $key: 'FASTING',
      $value: 'monthly'
    }, {
      $key: 'GC',
      $value: 'Mo,Th'
    }];

    allTasks = [{
      $key: 'BOFM90',
      title: 'Book of Mormon 90',
      description: 'Desc 1',
      defaultInterval: 'daily',
      points: 1,
      subTasks: true
    }, {
      $key: 'DTG',
      title: 'Duty to God',
      description: 'Desc 2',
      points: 1,
      defaultInterval: 'Su'
    }, {
      $key: 'FASTING',
      title: 'Fasting',
      description: 'Desc 3',
      points: 20,
      defaultInterval: 'monthly'
    }, {
      $key: 'GC',
      title: 'General Conference',
      description: 'Desc 4',
      points: 1,
      defaultInterval: 'Mo,Th'
    }];

    subTasks = {
      BOFM90: {
        ST2: {
          order: 1,
          title: '1 Nephi 4-6',
          link: 'https://www.lds.org/scriptures/bofm/1-ne/4'
        },
        ST1: {
          order: 0,
          title: '1 Nephi 1-3'
        }
      }
    };

    fixture = TestBed.createComponent(EditScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load programs', () => {
    expect(mockAngularFire.database.list).toHaveBeenCalledWith('/programs', {
      query: {
        orderByChild: 'order'
      }
    });
    component.programs.subscribe((list) => {
      expect(list).toEqual(programs);
    });
  });

  it('should load all tasks', () => {
    expect(mockAngularFire.database.list).toHaveBeenCalledWith('/tasks', {
      query: {
        orderByChild: 'title'
      }
    });
    component.tasks.subscribe((list) => {
      expect(list).toEqual(allTasks);
    });
  });

  it('should load all sub tasks', () => {
    expect(mockAngularFire.database.object).toHaveBeenCalledWith('/subTasks');
    expect(component.subTasks).toEqual(subTasks);
  });

  it('should setup the edit form', () => {
    expect(component.editForm.controls['programTitle'].value).toEqual('SP90X - Men');
    expect(component.editForm.controls['startDate'].value).toEqual(moment().format('YYYY-MM-DD'));
    expect(component.editForm.controls['program'].value).toEqual('CLASSIC-M');
  });

  describe('program change', () => {

    it('should load program tasks', () => {
      component.programControl.setValue('PROG1');
      fixture.detectChanges();
      component.filteredTasks.subscribe((tasks) => {
        expect(_.map(tasks, '$key')).toEqual(['BOFM90', 'FASTING', 'GC']);
      });
    });

    it('should leave the initial title', () => {
      component.programControl.setValue('PROG1');
      fixture.detectChanges();
      expect(component.editForm.get('programTitle').value).toBe('SP90X - Men');
    });

    it('should set the initial title', () => {
      component.programControl.setValue('CLASSIC-W');
      fixture.detectChanges();
      expect(component.editForm.get('programTitle').value).toBe('SP90X - Women');
    });

    it('should change the title', () => {
      component.programControl.setValue('CLASSIC-W');
      fixture.detectChanges();
      expect(component.editForm.get('programTitle').value).toBe('SP90X - Women');
      component.programControl.setValue('CLASSIC-M');
      fixture.detectChanges();
      expect(component.editForm.get('programTitle').value).toBe('SP90X - Men');
    });

    it('should leave the title if changed', () => {
      component.programControl.setValue('CLASSIC-M');
      fixture.detectChanges();
      expect(component.editForm.get('programTitle').value).toBe('SP90X - Men');
      component.editForm.get('programTitle').setValue('SP90X - Men - Changed');
      component.programControl.setValue('CLASSIC-W');
      fixture.detectChanges();
      expect(component.editForm.get('programTitle').value).toBe('SP90X - Men - Changed');
    });

  });

  describe('save', () => {
    beforeEach(() => {
      component.programControl.setValue('PROG1');
      component.editForm.setValue({
        programTitle: 'My Schedule',
        program: 'PROG1',
        startDate: '2016-12-27'
      });
      fixture.detectChanges();
    });

    it('should not save an invalid schedule', fakeAsync(() => {
      component.editForm.setValue({
        programTitle: '',
        program: '',
        startDate: '2016-12-27'
      });
      fixture.detectChanges();
      component.save();
      fixture.detectChanges();
      tick();
      tick();
      expect(mockSchedule.create).not.toHaveBeenCalled();
    }));

    it('should save a valid schedule', fakeAsync(() => {
      component.save();
      tick();
      expect(mockSchedule.create).toHaveBeenCalledWith('U1', {
        program: 'PROG1',
        programTitle: 'My Schedule',
        startDate: '2016-12-27T07:00:00.000Z',
        tasks: {
          BOFM90: 'daily',
          FASTING: 'monthly',
          GC: 'Mo,Th'
        }
      });
    }));

    it('should save valid with tasks omitted', fakeAsync(() => {
      component.filteredTasks.first().subscribe((taskList: any[]) => {
        taskList[2].include = false;
      });
      component.save();
      tick();
      expect(mockSchedule.create).toHaveBeenCalledWith('U1', {
        program: 'PROG1',
        programTitle: 'My Schedule',
        startDate: '2016-12-27T07:00:00.000Z',
        tasks: {
          BOFM90: 'daily',
          FASTING: 'monthly',
        }
      });
    }));

    it('should navigate home', fakeAsync(() => {
      component.save();
      tick();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    }));

  });

  describe('cancel', () => {

    it('should navigate home', () => {
      component.cancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

  });

});
