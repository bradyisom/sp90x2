import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit {
  list: FirebaseListObservable<any> = null;

  constructor(private auth: AuthService, private af: AngularFire) { }

  ngOnInit() {
    this.auth.user.subscribe(user => {
      if (user) {
        this.list = this.af.database.list(`/schedules/${user.uid}`);
      }
      else {
        this.list = null;
      }
    });
  }

  removeSchedule(schedule: any) {
    this.list.remove(schedule);
  }

}
