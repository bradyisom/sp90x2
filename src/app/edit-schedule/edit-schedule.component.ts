import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import * as moment from 'moment';
import 'moment-range';
import * as _ from 'lodash';

@Component({
  selector: 'app-edit-schedule',
  templateUrl: './edit-schedule.component.html',
  styleUrls: ['./edit-schedule.component.scss']
})
export class EditScheduleComponent implements OnInit {
  userId: string;
  scheduleId: string;
  public editForm: FormGroup;
  public schedule: FirebaseObjectObservable<any>;
  public programs: FirebaseListObservable<any>;
  public filteredTasks: Observable<any>;
  programTasks: FirebaseListObservable<any>;
  tasks: FirebaseListObservable<any>;
  subTasks: any;

  constructor(
    private route: ActivatedRoute, private router: Router,
    private auth: AuthService, private af: AngularFire
  ) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      this.scheduleId = params['id'];
    });

    let programControl = new FormControl('', Validators.required);
    programControl.valueChanges.subscribe((programId: string) => this.programChange(programId));

    this.editForm = new FormGroup({
      programTitle: new FormControl('SP90X Classic', Validators.required),
      startDate: new FormControl(moment().format('YYYY-MM-DD'), Validators.required),
      program: programControl
    });

    this.programs = this.af.database.list('/programs');
    this.tasks = this.af.database.list('/tasks', {
      query: {
        orderByChild: 'title'
      }
    });
    this.af.database.object(`/subTasks`).subscribe((subTasks) => {
      this.subTasks = subTasks;
    });

    this.auth.user.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        if (this.scheduleId) {
          this.schedule = this.af.database.object(`/schedules/${this.userId}/${this.scheduleId}`)
          this.schedule.subscribe((schedule) => {
            this.editForm.setValue({
              programTitle: schedule.programTitle,
              startDate: moment(schedule.startDate).format('YYYY-MM-DD'),
              program: schedule.program || ''
            });
            return true;
          });
        }
      }
      else {
        this.userId = null;
      }
    });

  }

  programChange(programId: string) {
    this.programTasks = this.af.database.list(`/programs/${programId}/tasks`);
    this.programTasks.subscribe(() => {
      this.filteredTasks = this.tasks.withLatestFrom(this.programTasks)
        .map(([tasks, programTasks]) => {
          let val = _.filter(tasks, (t: any)=> {
            return !!_.find(programTasks, {$key: t.$key});
          });
          return val;
        }).take(1).publishReplay(1).refCount();
    });
  }

  save() {
    // console.log('save', this.editForm.value);
    if (this.editForm.invalid) {
      return;
    }

    let startDate = moment(this.editForm.value.startDate, 'YYYY-MM-DD');
    let endDate = moment(startDate).add(90, 'days');

    // Calculate all of the tasks
    let orders = {};
    let pointsPossible = 0;
    this.filteredTasks.reduce((tasks: any, taskList: any) => {
      moment.range(startDate, endDate).by('days', (day)=> {
        for (let task of taskList) {
          if (task.defaultInterval == 'monthly') {
            if(day.isSame(startDate, 'day') || day.date() == 1) {
              let key = day.format('YYYY-MM'); 
              tasks.monthly[key] = tasks.monthly[key] || {};
              tasks.monthly[key][task.$key] = {
                title: task.title,
                description: task.description,
                points: task.points,
                finished: false
              };
              pointsPossible += task.points;
              if (task.subTasks) {
                let order = orders[task.$key] = orders[task.$key] || 0;
                let subTasks: any[] = _.sortBy(_.values(this.subTasks[task.$key]), 'order');
                if (subTasks[order]) {
                  tasks.daily[key][task.$key].subTask = subTasks[order].title;
                  orders[task.$key]++;
                }
              }
            }
          }
          else {
            let weekday = day.format('dd');
            if(task.defaultInterval == 'daily' ||
                task.defaultInterval.split(',').some((value: string) => value == weekday)) {
              let key = day.format('YYYY-MM-DD'); 
              tasks.daily[key] = tasks.daily[key] || {};
              tasks.daily[key][task.$key] = {
                title: task.title,
                description: task.description,
                points: task.points,
                finished: false
              };
              pointsPossible += task.points;
              if (task.subTasks) {
                let order = orders[task.$key] = orders[task.$key] || 0;
                let subTasks: any[] = _.sortBy(_.values(this.subTasks[task.$key]), 'order');
                if (subTasks[order]) {
                  tasks.daily[key][task.$key].subTask = subTasks[order].title;
                  orders[task.$key]++;
                }
              }
            }
          }
        }
      });
      return tasks;
    }, {
      daily: {},
      monthly: {}
    }).subscribe((tasks) => {
      let newValue = _.extend({}, this.editForm.value, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        points: 0,
        pointsPossible: pointsPossible,
        entries: tasks
      });

      if (this.schedule) {
        this.schedule.set(newValue);
      }
      else {
        let schedules = this.af.database.list(`/schedules/${this.userId}`);
        schedules.push(newValue);
      }

      this.router.navigate(['/home']);
    });


  }

}
