import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseApp, AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ScheduleService } from '../models/schedule.service';
import { Group, GroupService } from '../models/group.service';
import { ErrorService } from '../error.service';
import { ConfirmService } from '../confirm.service';

import * as moment from 'moment';
import * as _ from 'lodash';


@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.scss']
})
export class EditGroupComponent implements OnInit, OnDestroy {
  public editForm: FormGroup;

  private user: any;
  public groupId: string;
  private group: FirebaseObjectObservable<any>;
  public schedules: Observable<any[]>;
  private schedulesSnapshot: any[];

  private schedule: any;
  private imageUrl: string;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scheduleService: ScheduleService,
    private groups: GroupService,
    private error: ErrorService,
    private confirm: ConfirmService,
    @Inject(FirebaseApp) private firebase: any,
  ) { }

  ngOnInit() {
    this.groupId = this.route.snapshot.params['id'];
    this.user = this.route.snapshot.data['user'];

    this.editForm = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      // public: new FormControl(true),
      // hasSchedule: new FormControl(false),
      schedule: new FormControl(null, Validators.required),
    });

    // this.subscriptions.push(this.editForm.get('hasSchedule').valueChanges.subscribe(() => {
    //   if (!this.schedules) {
    //     this.schedules = this.scheduleService.listSchedules(this.user.uid);
    //     this.subscriptions.push(this.schedules.subscribe((schedules) => {
    //       this.schedulesSnapshot = schedules;
    //     }));
    //   }
    // }));
    this.schedules = this.scheduleService.listSchedules(this.user.uid);
    this.subscriptions.push(this.schedules.subscribe((schedules) => {
      this.schedulesSnapshot = schedules;
    }));

    this.subscriptions.push(this.editForm.get('schedule').valueChanges.subscribe(() => {
        const scheduleKey = this.editForm.get('schedule').value;
        this.schedule = _.find(this.schedulesSnapshot, (s) => {
          return s.$key === scheduleKey;
        });
    }));

    if (this.groupId) {
      this.group = this.groups.get(this.groupId);
      this.group.first().subscribe((group) => {
        this.editForm.get('name').setValue(group.name);
        this.editForm.get('description').setValue(group.description);
        // this.editForm.get('public').setValue(group.public);
        // this.editForm.get('hasSchedule').setValue(true);
        this.editForm.get('schedule').setValue(group.schedule);
        this.imageUrl = group.imageUrl;
      });
    } else {
      const storageRef = this.firebase.storage().ref().child(`app-images/abstract${Math.floor(Math.random() * 10) + 1}.jpg`);
      storageRef.getDownloadURL().then(url => this.imageUrl = url);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => {
      s.unsubscribe();
    });
  }

  save() {
    if (this.editForm.invalid) {
      return;
    }

    const startDate = moment(this.editForm.value.startDate, 'YYYY-MM-DD').startOf('day');
    const endDate = moment(startDate).add(89, 'days').endOf('day');

    const newValue: Group = {
      name: this.editForm.get('name').value,
      description: this.editForm.get('description').value,
      public: true,
      // public: this.editForm.get('public').value,
      owner: this.user.uid,
      imageUrl: this.imageUrl,
      schedule: this.schedule.$key,
      startDate: this.schedule.startDate,
      endDate: this.schedule.endDate,
      programTitle: this.schedule.programTitle,
      program: this.schedule.program,
      tasks: this.schedule.tasks
    };

    let promise;
    if (this.groupId) {
      promise = this.groups.update(this.groupId, newValue);
    } else {
      promise = this.groups.create(newValue, this.user);
    }
    promise.then(() => {
      this.router.navigate(['/groups']);
    }).catch((e) => {
      this.error.show(e, 'Unable to save group');
    });
  }

  cancel() {
    this.router.navigate(['/groups']);
  }

  delete() {
    const groupName = this.editForm.get('name').value;
    const dialogRef = this.confirm.show(
      `Are you sure you want to delete the '${groupName}' group?`,
      'Delete Group',
      'warn'
    );
    dialogRef.afterClosed().first().subscribe(result => {
      if (result === 'confirm') {
        this.groups.delete(this.groupId).then(() => {
          this.router.navigate(['/groups']);
        }).catch((e) => {
          this.error.show(e, 'Unable to delete group');
        });
      }
    });
  }

}
