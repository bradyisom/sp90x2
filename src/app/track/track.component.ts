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
  public date: any = moment().startOf('day').toISOString();
  public programDay: number;
  public dailyEntries: FirebaseListObservable<any[]>;
  public monthlyEntries: FirebaseListObservable<any[]>;
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
        this.date = moment(params['date'], 'YYYY-MM-DD').startOf('day').toISOString();
      }
      else {
        this.router.navigate(['.', moment(this.date).format('YYYY-MM-DD')], {
          relativeTo: this.route,
          replaceUrl: true
        });
      }
    });

    this.schedule = this.af.database.object(`/schedules/${this.userId}/${this.scheduleId}`);
    let scheduleSubscription = this.schedule.take(1).subscribe((schedule) => {
      scheduleSubscription.unsubscribe();
      this.startDate = moment(schedule.startDate);
      this.endDate = moment(schedule.endDate);
      this.points = schedule.points;
      this.loadDay();
    });
  }

  loadDay() {
    let day: string = moment(this.date).format('dd');

    this.programDay = moment(this.date).diff(this.startDate, 'days')+1;

    this.dailyEntries = this.af.database.list(
      `/entries/${this.scheduleId}/daily/${moment(this.date).format('YYYY-MM-DD')}`
    );

    this.monthlyEntries = this.af.database.list(
      `/entries/${this.scheduleId}/monthly/${moment(this.date).format('YYYY-MM')}`
    );

  }

  moveDay(num: number) {
    let next = moment(this.date).add(num, 'days');
    this.router.navigate(['..', next.format('YYYY-MM-DD')], {
      relativeTo: this.route
    });
    this.date = next.toISOString();
    this.loadDay();
  }

  showFitTest() {
    return [1, 30, 60, 90].indexOf(this.programDay) !== -1;
  }

  getDay() {
    return moment(this.date).format('YYYY-MM-DD');
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
