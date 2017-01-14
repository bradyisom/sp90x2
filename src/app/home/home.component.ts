import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { AuthService } from '../auth.service';
import { ConfirmService } from '../confirm.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  public user: Observable<any>;
  private rawList: FirebaseListObservable<any>;
  public list: Observable<any>;

  private userSubscription: Subscription;

  constructor(
    private auth: AuthService,
    private af: AngularFire,
    private confirm: ConfirmService,
  ) {
  }

  ngOnInit() {
    this.user = this.auth.user;
    this.userSubscription = this.user.subscribe(user => {
      if (user) {
        this.rawList = this.af.database.list(`/schedules/${user.uid}`, {
          query: {
            orderByChild: 'startDate'
          }
        });
        this.list = this.rawList.map((list) => {
          return list.reverse();
        });
      } else {
        this.list = null;
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  removeSchedule(schedule: any) {
    const dialogRef = this.confirm.show(
      `Are you sure you want to delete this schedule?`,
      'Delete',
      'warn'
    );
    dialogRef.afterClosed().first().subscribe(result => {
      if (result === 'confirm') {
        this.af.database.object(`/entries/${schedule.$key}`).remove().then(() => {
          this.rawList.remove(schedule);
        });
      }
    });

  }

}
