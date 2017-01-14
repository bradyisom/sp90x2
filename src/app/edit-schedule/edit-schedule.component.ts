import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/publishReplay';
import {
  // ActivatedRoute, Params,
  Router
} from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
    // private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private af: AngularFire
  ) { }

  ngOnInit() {
    // this.route.params.forEach((params: Params) => {
    //   this.scheduleId = params['id'];
    // });

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
      // if (this.scheduleId) {
      //   this.schedule = this.af.database.object(`/schedules/${this.userId}/${this.scheduleId}`);
      //   this.schedule.first().subscribe((schedule) => {
      //     this.editForm.setValue({
      //       programTitle: schedule.programTitle,
      //       startDate: moment(schedule.startDate).format('YYYY-MM-DD'),
      //       program: schedule.program || ''
      //     });
      //     return true;
      //   });
      // }
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

    const startDate = moment(this.editForm.value.startDate, 'YYYY-MM-DD').startOf('day');
    const endDate = moment(startDate).add(89, 'days').endOf('day');

    // Calculate all of the tasks
    const orders = {};
    let pointsPossible = 0;
    let scheduleTasks;
    this.filteredTasks
    .map((taskList: any[]) => {
      return scheduleTasks = _.filter(taskList, task => task.include);
    }).reduce((tasks: any, taskList: any) => {
      moment.range(startDate, endDate).by('days', (day) => {
        for (const task of taskList) {
          if (task.defaultInterval === 'monthly') {
            if (day.isSame(startDate, 'day') || day.date() === 1) {
              const key = day.format('YYYY-MM');
              tasks.monthly[key] = tasks.monthly[key] || {};
              tasks.monthly[key][task.$key] = {
                points: task.points,
                finished: false
              };
              pointsPossible += task.points;
              // if (task.subTasks) {
              //   const order = orders[task.$key] = orders[task.$key] || 0;
              //   const subTasks: any[] = _.sortBy(_.values(this.subTasks[task.$key]), 'order');
              //   if (subTasks[order]) {
              //     tasks.monthly[key][task.$key].subTask = subTasks[order].title;
              //     if (subTasks[order].link) {
              //       tasks.monthly[key][task.$key].subTaskLink = subTasks[order].link;
              //     }
              //     orders[task.$key]++;
              //   }
              // }
            }
          } else {
            const weekday = day.format('dd');
            if (task.defaultInterval === 'daily' ||
                task.defaultInterval.split(',').some((value: string) => value === weekday)) {
              const key = day.format('YYYY-MM-DD');
              tasks.daily[key] = tasks.daily[key] || {};
              tasks.daily[key][task.$key] = {
                points: task.points,
                finished: false
              };
              pointsPossible += task.points;
              if (task.subTasks) {
                const order = orders[task.$key] = orders[task.$key] || 0;
                tasks.daily[key][task.$key].order = order;
                orders[task.$key]++;

                // const subTasks: any[] = _.sortBy(_.values(this.subTasks[task.$key]), 'order');
                // if (subTasks[order]) {
                //   tasks.daily[key][task.$key].subTask = subTasks[order].title;
                //   if (subTasks[order].link) {
                //     tasks.daily[key][task.$key].subTaskLink = subTasks[order].link;
                //   }
                //   orders[task.$key]++;
                // }
              }
            }
          }
        }
      });
      return tasks;
    }, {
      daily: {},
      monthly: {}
    }).first().subscribe((tasks) => {
      const newValue = _.extend({}, this.editForm.value, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        points: 0,
        pointsPossible: pointsPossible,
        tasks: _.reduce(scheduleTasks, (result, task: any) => {
          result[task.$key] = task.defaultInterval;
          return result;
        }, {})
      });

      // const promise;
      // if (this.schedule) {
      //   promise = this.schedule.set(newValue);
      // } else {
      //   const schedules = this.af.database.list(`/schedules/${this.userId}`);
      //   promise = schedules.push(newValue);
      // }
      // promise.then((result: any) => {
      this.af.database.list(`/schedules/${this.userId}`).push(newValue)
        .then((result: any) => {
          this.scheduleId = this.scheduleId || result.key;

          const entriesObj = this.af.database.object(`/entries/${this.scheduleId}`);
          return entriesObj.set(tasks);
        }).then(() => {
          this.router.navigate(['/home']);
        });
    });


  }

  cancel() {
    this.router.navigate(['/home']);
  }

}
