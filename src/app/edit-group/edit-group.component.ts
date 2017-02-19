import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MdSnackBar, MdDialog } from '@angular/material';
import { FirebaseApp, AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ScheduleService } from '../models/schedule.service';
import { Group, GroupService } from '../models/group.service';
import { ErrorService } from '../error.service';
import { ConfirmService } from '../confirm.service';
import { ChooseImageComponent } from '../choose-image/choose-image.component';

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
  public imageUrl: BehaviorSubject<string> = new BehaviorSubject<string>('');

  private subscriptions: Subscription[] = [];
  private storageRef: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scheduleService: ScheduleService,
    private groups: GroupService,
    private error: ErrorService,
    private confirm: ConfirmService,
    private snackbar: MdSnackBar,
    private dialog: MdDialog,
    @Inject(FirebaseApp) private firebase: any,
  ) {
    this.storageRef = this.firebase.storage().ref();
  }

  ngOnInit() {
    this.groupId = this.route.snapshot.params['id'];
    this.user = this.route.snapshot.data['user'];
    const initialSchedule = this.route.snapshot.queryParams['scheduleId'];

    this.editForm = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      schedule: new FormControl(initialSchedule || null, Validators.required),
    });

    this.schedules = this.scheduleService.listSchedules(this.user.uid);
    this.subscriptions.push(this.schedules.subscribe((schedules) => {
      this.schedulesSnapshot = schedules;
      this.updateSchedule();
    }));

    this.subscriptions.push(this.editForm.get('schedule').valueChanges.subscribe(() => {
      this.updateSchedule();
    }));

    if (this.groupId) {
      this.group = this.groups.get(this.groupId);
      this.group.first().subscribe((group) => {
        this.editForm.get('name').setValue(group.name);
        this.editForm.get('description').setValue(group.description);
        this.editForm.get('schedule').setValue(group.schedule);
        this.imageUrl.next(group.imageUrl);
        this.updateSchedule();
      });
    } else {
      const storageRef = this.storageRef.child(`app-images/abstract${Math.floor(Math.random() * 10) + 1}.jpg`);
      storageRef.getDownloadURL().then(url => this.imageUrl.next(url));
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => {
      s.unsubscribe();
    });
  }

  updateSchedule() {
    const scheduleKey = this.editForm.get('schedule').value;
    this.schedule = _.find(this.schedulesSnapshot, (s) => {
      return s.$key === scheduleKey;
    });
  }

  chooseImage() {
    this.dialog.open(ChooseImageComponent)
    .afterClosed().first().subscribe((imageUrl) => {
      if (imageUrl) {
        this.imageUrl.next(imageUrl);
      }
    });
  }

  save() {
    if (this.editForm.invalid) {
      return;
    }

    const startDate = moment(this.editForm.value.startDate, 'YYYY-MM-DD').startOf('day');
    const endDate = moment(startDate).add(89, 'days').endOf('day');

    const saveImage = this.imageUrl.value.startsWith('data:image/png;base64,');

    const newValue: Group = {
      name: this.editForm.get('name').value,
      description: this.editForm.get('description').value,
      public: true,
      owner: this.user.uid,
      imageUrl: saveImage ? 'about:blank' : this.imageUrl.value,
      schedule: this.schedule.$key,
      startDate: this.schedule.startDate,
      endDate: this.schedule.endDate,
      programTitle: this.schedule.programTitle,
      program: this.schedule.program,
      tasks: this.schedule.tasks
    };
    let storageRef: any;

    const snackbarRef = this.snackbar.open('Saving...');
    let promise;
    if (this.groupId) {
      promise = this.groups.update(this.groupId, newValue);
    } else {
      promise = this.groups.create(newValue, this.user);
    }
    promise.then((groupId) => {
      this.groupId = this.groupId || groupId;
      // Save the image to the user's group folder
      storageRef = this.storageRef.child(`user/${this.user.uid}/${this.groupId}/thumbnail.png`);
      if (saveImage) {
        const imageUrl = this.imageUrl.value.substr('data:image/png;base64,'.length);
        return storageRef.putString(imageUrl, 'base64', {
          contentType: 'image/png'
        });
      }
    }).then((snapshot) => {
      if (saveImage) {
        newValue.imageUrl = snapshot.downloadURL;
        return this.groups.update(this.groupId, newValue);
      }
    }).then(() => {
      snackbarRef.dismiss();
      this.snackbar.open('Saved Group!', undefined, {
        duration: 2000
      });
      this.router.navigate(['/groups']);
    }).catch((e) => {
      snackbarRef.dismiss();
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
