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
  private rawList: FirebaseListObservable<any>;
  public list: Observable<any>;

  constructor(private auth: AuthService, private af: AngularFire) { 
  }

  ngOnInit() {
    this.user = this.auth.user;
    this.user.subscribe(user => {
      if (user) {
        this.rawList = this.af.database.list(`/schedules/${user.uid}`, {
          query: {
            orderByChild: 'startDate'
          }
        })
        this.list = this.rawList.map((list)=> {
          return list.reverse();
        });
      }
      else {
        this.list = null;
      }
    });
  }

  removeSchedule(event: any, schedule: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.af.database.object(`/entries/${schedule.$key}`).remove().then(() => {
      this.rawList.remove(schedule);
    });
  }

}
