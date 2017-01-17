import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/publishReplay';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ScheduleService, Schedule } from '../models/schedule.service';

import * as moment from 'moment';
import 'moment-range';
import * as _ from 'lodash';

@Component({
  selector: 'app-edit-schedule',
  templateUrl: './edit-schedule.component.html',
  styleUrls: ['./edit-schedule.component.scss']
})
export class EditScheduleComponent implements OnInit, OnDestroy {
  userId: string;
  scheduleId: string;
  public editForm: FormGroup;
  public programControl: FormControl;
  public schedule: FirebaseObjectObservable<any>;
  public programs: FirebaseListObservable<any>;
  public filteredTasks: Observable<any>;
  programTasks: FirebaseListObservable<any>;
  tasks: FirebaseListObservable<any>;
  subTasks: any;
  programsSnapshot: any[];
  programsSubscription: Subscription;
  public currentProgram: any = null;

  constructor(
    private router: Router,
    private auth: AuthService,
    private af: AngularFire,
    private schedules: ScheduleService,
  ) { }

  ngOnInit() {
    this.programControl = new FormControl('');
    this.programControl.valueChanges.subscribe((programId: string) => this.programChange(programId));

    this.editForm = new FormGroup({
      programTitle: new FormControl('', Validators.required),
      startDate: new FormControl(moment().format('YYYY-MM-DD'), Validators.required),
      program: this.programControl
    });

    this.programs = this.af.database.list('/programs', {
      query: {
        orderByChild: 'order'
      }
    });

    this.tasks = this.af.database.list('/tasks', {
      query: {
        orderByChild: 'title'
      }
    });

    this.programsSubscription = this.programs.subscribe((programs) => {
      this.programsSnapshot = programs;
      this.programControl.setValue(this.programsSnapshot[0].$key);
      this.programChange(this.programsSnapshot[0].$key);
    });

    this.af.database.object(`/subTasks`).first().subscribe((subTasks) => {
      this.subTasks = subTasks;
    });

    this.auth.user.first().subscribe(user => {
      this.userId = user.uid;
    });

  }

  ngOnDestroy() {
    this.programsSubscription.unsubscribe();
  }

  programChange(programId: string) {
    const newProgram = _.find(this.programsSnapshot, {$key: programId});
    const titleField = this.editForm.get('programTitle');
    if (newProgram && (!this.currentProgram || (this.currentProgram && this.currentProgram.title === titleField.value))) {
      titleField.setValue(newProgram.title);
    }
    this.currentProgram = newProgram;

    this.programTasks = this.af.database.list(`/programs/${programId}/tasks`);
    this.programTasks.first().subscribe(() => {
      this.filteredTasks = this.tasks.withLatestFrom(this.programTasks)
        .map(([tasks, programTasks]) => {
          const val = _.filter(tasks, (t: any) => {
            return !!_.find(programTasks, {$key: t.$key});
          });
          val.forEach((task) => {
            task.include = true;
          });
          return val;
        })
        .take(1).publishReplay(1).refCount();
    });
  }

  save() {
    // console.log('save', this.editForm.value);
    if (this.editForm.invalid) {
      return;
    }

    this.filteredTasks.map((taskList: any[]) => {
      const scheduleTasks = _.filter(taskList, task => task.include);
      this.schedules.create(this.userId, {
        program: this.editForm.get('program').value,
        programTitle: this.editForm.get('programTitle').value,
        startDate: moment(this.editForm.value.startDate, 'YYYY-MM-DD').startOf('day').toISOString(),
        tasks: _.reduce(scheduleTasks, (result, task: any) => {
          result[task.$key] = task.defaultInterval;
          return result;
        }, {})
      }).then((scheduleId) => {
        this.router.navigate(['/home']);
      });
    }).first().subscribe();
  }

  cancel() {
    this.router.navigate(['/home']);
  }

}
