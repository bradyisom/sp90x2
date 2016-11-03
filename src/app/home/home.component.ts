import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public user: Observable<any>;
  public activeSchedules: FirebaseListObservable<any>;

  constructor(private auth: AuthService, private af: AngularFire) { 
  }

  ngOnInit() {
    this.user = this.auth.user;
    this.user.subscribe(user => {
      if (user) {
        this.activeSchedules = this.af.database.list(`/schedules/${user.uid}`);
      }
      else {
        this.activeSchedules = null;
      }
    });
  }

}
