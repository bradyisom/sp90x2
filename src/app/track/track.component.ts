import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { AuthService } from '../auth.service';

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
  public dailyEntries: FirebaseListObservable<any[]>;
  public monthlyEntries: FirebaseListObservable<any[]>;
  public fitTest: FirebaseObjectObservable<any> | null;
  userId: string;
  scheduleId: string;
  startDate: any;
  endDate: any;
  points: number;

  constructor(
    private route: ActivatedRoute,
    private af: AngularFire,
    private router: Router) {
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
      }
      else {
        this.navigateDate(moment().startOf('day'));
      }
    });
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

    let day: string = this.date.format('dd');

    this.programDay = this.date.diff(this.startDate, 'days')+1;

    if (this.showFitTest()) {
      this.fitTest = this.af.database.object(`/entries/${this.scheduleId}/fitTest/${this.date.format('YYYY-MM-DD')}`);
    }
    else {
      this.fitTest = null;
    }

    this.dailyEntries = this.af.database.list(
      `/entries/${this.scheduleId}/daily/${this.date.format('YYYY-MM-DD')}`
    );

    this.monthlyEntries = this.af.database.list(
      `/entries/${this.scheduleId}/monthly/${this.date.format('YYYY-MM')}`
    );

  }

  moveDay(num: number) {
    let next = moment(this.date).add(num, 'days');
    this.router.navigate(['..', next.format('YYYY-MM-DD')], {
      relativeTo: this.route
    });
    this.date = next;
    this.loadDay();
  }

  showFitTest() {
    return [1, 30, 60, 90].indexOf(this.programDay) !== -1;
  }

  getDay() {
    return this.date.format('YYYY-MM-DD');
  }

  checkEntry(type: string, task: any, value: boolean) {
    if (type == 'daily') {
      this.dailyEntries.update(task.$key, {finished: value});
    } else if (type == 'monthly') {
      this.monthlyEntries.update(task.$key, {finished: value});
    }
    if (value) {
      this.points += task.points;
    } else {
      this.points -= task.points;
    }
    this.schedule.update({points: this.points});
  }

}
