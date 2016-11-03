import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { AuthService } from '../auth.service';

import * as moment from 'moment';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit {
  public schedule: FirebaseObjectObservable<any>;
  public date: any = moment().startOf('day').toISOString();
  public programDay: number;
  public dailyTasks: Observable<any>;
  public monthlyTasks: Observable<any>;
  scheduleId: string;
  startDate: any;
  endDate: any;
  program: any;
  tasks: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private af: AngularFire,
    private router: Router) {
  }

  ngOnInit() {
    let userId: string = this.route.snapshot.data['user'].uid;
    this.route.params.forEach((params: Params) => {
      this.scheduleId = params['scheduleId'];
      if (params['date']) {
        this.date = moment(params['date'], 'YYYY-MM-DD').startOf('day').toISOString();
      }
    });

    this.schedule = this.af.database.object(`/schedules/${userId}/${this.scheduleId}`);
    this.schedule.subscribe((schedule) => {
      this.startDate = moment(schedule.startDate);
      this.endDate = moment(schedule.endDate);
      this.af.database.object(`/programs/${schedule.program}`).subscribe((program) => {
        this.program = program;
        this.tasks = this.af.database.list(`/tasks`);
        this.loadDay();
      });
    });
  }

  loadDay() {
    let day: string = moment(this.date).format('dd');

    this.programDay = moment(this.date).diff(this.startDate, 'days')+1;
    this.dailyTasks = this.tasks.map((tasks) => {
      // console.log('program.tasks', this.program.tasks);
      return _.filter(tasks, (t: any) => {
        let frequency: string = this.program.tasks[t.$key];
        if (!frequency) {
          return false;
        }
        let doToday: boolean = frequency == 'daily' || frequency.split(',').some((value: string) => value == day);
        if (doToday && t.subTasks) {
          this.af.database.list(`/subTasks/${t.$key}`, {
            query: {
              orderByChild: 'order',
              equalTo: this.getTaskOrder(frequency),
              limitToFirst: 1
            }
          }).subscribe((subTasks) => {
            if (subTasks[0]) {
              t.subTaskText = subTasks[0].title;
            }
          });
        }
        return doToday;
      });
    });

    this.monthlyTasks = this.tasks.map((tasks) => {
      // console.log('program.tasks', this.program.tasks);
      return _.filter(tasks, (t: any) => {
        let frequency: string = this.program.tasks[t.$key];
        if (!frequency) {
          return false;
        }
        let doToday: boolean = frequency == 'monthly';
        return doToday;
      });
    });
  }

  getTaskOrder(frequency: string): number {
    if (frequency == 'daily') {
      return moment(this.date).diff(this.startDate, 'days');
    }
    if (frequency == 'weekly') {
      return moment(this.date).diff(this.startDate, 'weeks');
    }
    if (frequency == 'monthly') {
      return moment(this.date).diff(this.startDate, 'months');
    }
    let count: number = 0;
    let today = moment(this.date);
    let weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    for (let weekday of frequency.split(',')) {
      let isoWeekday = weekdays.indexOf(weekday) + 1;
      let daysToAdd = ((7 + isoWeekday) - this.startDate.isoWeekday()) % 7;
      if (isoWeekday == today.isoWeekday()) {
        daysToAdd = 0;
      }
      let nextDay = today.clone().add(daysToAdd, 'days');
      let weeksBetween = nextDay.diff(this.startDate, 'weeks') + 1
      count += weeksBetween;
      // console.log('weekday', weekday, isoWeekday, weeksBetween);
    }
    return Math.max(0, count - 1);
  }

  moveDay(num: number) {
    let next = moment(this.date).add(num, 'days');
    this.router.navigate(['.'], {
      queryParams: {
        date: next.format('YYYY-MM-DD')
      },
      relativeTo: this.route
    });
    this.date = next.toISOString();
    this.loadDay();
  }

}
