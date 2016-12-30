import { Component, OnInit, OnDestroy } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { AuthService } from '../auth.service';
import { ConfirmDeleteScheduleComponent } from '../confirm-delete-schedule/confirm-delete-schedule.component';

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
  private confirmDialogRef: MdDialogRef<ConfirmDeleteScheduleComponent>;

  constructor(
    private auth: AuthService,
    private af: AngularFire,
    private dialog: MdDialog) {
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
    this.confirmDialogRef = this.dialog.open(ConfirmDeleteScheduleComponent, {});
    this.confirmDialogRef.afterClosed().first().subscribe(result => {
      // console.log('result: ' + result);
      this.confirmDialogRef = null;
      if (result === 'delete') {
        this.af.database.object(`/entries/${schedule.$key}`).remove().then(() => {
          this.rawList.remove(schedule);
        });
      }
    });

  }

}
