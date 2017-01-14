import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { GroupService, Group } from '../models/group.service';
import { ScheduleService } from '../models/schedule.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit, OnDestroy {
  public group: Observable<Group>;
  public members: FirebaseListObservable<any>;
  public isOwner: boolean;
  public isMember: boolean;

  private groupSubscription: Subscription;

  private groupId: string;
  private user: any;

  constructor(
    private route: ActivatedRoute,
    private groups: GroupService,
    // private schedules: ScheduleService,
  ) { }

  ngOnInit() {
    this.groupId = this.route.snapshot.params['id'];
    this.user = this.route.snapshot.data['user'];

    this.group = this.groups.get(this.groupId).map((group) => {
      this.isOwner = group.owner === this.user.uid;
      return group;
    });

    this.members = this.groups.listGroupMembers(this.groupId);

    this.groupSubscription = this.groups.listUserGroups(this.user.uid).subscribe((userGroupIds) => {
      this.isMember = !!_.find(userGroupIds, k => k === this.groupId);
    });
  }

  ngOnDestroy() {
    this.groupSubscription.unsubscribe();
  }

  join() {
    this.groups.join(this.user, this.groupId);
  }

  leave() {
    this.groups.leave(this.user.uid, this.groupId);
  }

  // createSchedule() {
  //   // this.schedules.create(this.user.uid, );
  // }

}
