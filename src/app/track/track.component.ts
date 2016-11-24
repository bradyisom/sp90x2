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
  public dailyEntries: FirebaseListObservable<any[]>;
  public monthlyEntries: FirebaseListObservable<any[]>;
  userId: string;
  scheduleId: string;
  startDate: any;
  endDate: any;
  program: any;

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
    });

    this.schedule = this.af.database.object(`/schedules/${this.userId}/${this.scheduleId}`);
    this.schedule.subscribe((schedule) => {
      this.startDate = moment(schedule.startDate);
      this.endDate = moment(schedule.endDate);
      this.af.database.object(`/programs/${schedule.program}`).subscribe((program) => {
        this.program = program;
        this.loadDay();
      });
    });
  }

  loadDay() {
    let day: string = moment(this.date).format('dd');

    this.programDay = moment(this.date).diff(this.startDate, 'days')+1;

    this.dailyEntries = this.af.database.list(
      `/schedules/${this.userId}/${this.scheduleId}/entries/daily/${moment(this.date).format('YYYY-MM-DD')}`
    );

    this.monthlyEntries = this.af.database.list(
      `/schedules/${this.userId}/${this.scheduleId}/entries/monthly/${moment(this.date).format('YYYY-MM')}`
    );

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

  checkEntry(type: string, taskId: string, value: boolean) {
    if (type == 'daily') {
      this.dailyEntries.update(taskId, {finished: value});
    } else if (type == 'monthly') {
      this.monthlyEntries.update(taskId, {finished: value});
    }
  }

}
