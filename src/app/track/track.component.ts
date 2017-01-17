import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { AuthService } from '../auth.service';
import { ScheduleService } from '../models/schedule.service';

import * as moment from 'moment';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss'],
})
export class TrackComponent implements OnInit {
  public schedule: FirebaseObjectObservable<any>;
  public date: any;
  public programDay: number;
  public dailyEntries: Observable<any[]>;
  public monthlyEntries: Observable<any[]>;
  public fitTest: FirebaseObjectObservable<any> | null;
  userId: string;
  scheduleId: string;
  startDate: any;
  endDate: any;
  points: number;

  constructor(
    private route: ActivatedRoute,
    private af: AngularFire,
    private router: Router,
    private schedules: ScheduleService,
  ) {
  }

  ngOnInit() {
    this.userId = this.route.snapshot.data['user'].uid;
    this.route.params.forEach((params: Params) => {
      this.scheduleId = params['scheduleId'];
      if (params['date']) {
        this.date = moment(params['date'], 'YYYY-MM-DD').startOf('day');
        this.schedule = this.af.database.object(`/schedules/${this.userId}/${this.scheduleId}`);
        this.schedule.first().subscribe((schedule) => {
          this.startDate = moment(schedule.startDate).startOf('day');
          this.endDate = moment(schedule.endDate).endOf('day');
          this.points = schedule.points;
          this.loadDay();
        });
      } else {
        this.navigateDate(moment().startOf('day'));
      }
    });
  }

  public taskKey(task) {
    if (!task) {
      return '';
    }
    return task.$key;
  }

  navigateDate(date) {
    this.router.navigate(['/track', this.scheduleId, date.format('YYYY-MM-DD')], {
      replaceUrl: true
    });
  }

  loadDay() {
    if (this.date.isBefore(this.startDate)) {
      this.navigateDate(this.startDate);
      return;
    }
    if (this.date.isAfter(this.endDate)) {
      this.navigateDate(this.endDate);
      return;
    }

    const day: string = this.date.format('dd');

    this.programDay = this.date.diff(this.startDate, 'days') + 1;

    if (this.showFitTest()) {
      this.fitTest = this.af.database.object(`/entries/${this.scheduleId}/fitTest/${this.date.format('YYYY-MM-DD')}`);
    } else {
      this.fitTest = null;
    }

    this.dailyEntries = this.af.database.list(
      `/entries/${this.scheduleId}/daily/${this.date.format('YYYY-MM-DD')}`
    ).map((entries) => {
      entries.forEach(entry => {
        entry.details = this.af.database.object(`/tasks/${entry.$key}`);
        if (entry.order !== undefined) {
          entry.subtaskDetails = this.af.database.object(`/subTasks/${entry.$key}/${entry.order}`);
        }
      });
      return entries;
    });

    this.monthlyEntries = this.af.database.list(
      `/entries/${this.scheduleId}/monthly/${this.date.format('YYYY-MM')}`
    ).map((entries) => {
      entries.forEach(entry => {
        entry.details = this.af.database.object(`/tasks/${entry.$key}`);
      });
      return entries;
    });

  }

  public moveDay(num: number) {
    const next = moment(this.date).add(num, 'days');
    this.router.navigate(['..', next.format('YYYY-MM-DD')], {
      relativeTo: this.route
    });
    this.date = next;
    this.loadDay();
  }

  public showFitTest() {
    return [1, 30, 60, 90].indexOf(this.programDay) !== -1;
  }

  public getDay() {
    return this.date.format('YYYY-MM-DD');
  }

  public checkEntry(type: 'daily'|'monthly', task: any, value: boolean) {
    this.schedules.updateEntry(
      this.userId, this.scheduleId,
      type, this.date.toISOString(),
      task.$key, task.points, value
    );
  }

}
