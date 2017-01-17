import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import { ConfirmService } from '../confirm.service';
import { ScheduleService } from '../models/schedule.service';
import { WindowSizeService } from '../window-size.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public user: any;
  public list: Observable<any>;

  public columnCount: Observable<number>;

  private userSubscription: Subscription;

  constructor(
    private confirm: ConfirmService,
    private schedules: ScheduleService,
    private route: ActivatedRoute,
    private windowSize: WindowSizeService,
  ) {
    this.columnCount = this.windowSize.gridColumnCount;
  }

  ngOnInit() {
    this.user = this.route.snapshot.data['user'];
    this.list = this.schedules.listSchedules(this.user.uid);
  }

  removeSchedule(schedule: any) {
    const dialogRef = this.confirm.show(
      `Are you sure you want to delete this schedule?`,
      'Delete',
      'warn'
    );
    dialogRef.afterClosed().first().subscribe(result => {
      if (result === 'confirm') {
        this.schedules.delete(this.user.uid, schedule.$key);
      }
    });

  }

}
