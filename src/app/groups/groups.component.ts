import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import { GroupService, Group } from '../models/group.service';
import { WindowSizeService } from '../window-size.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit, OnDestroy {
  public user: any;
  public columnCount: BehaviorSubject<number>;

  public list: Observable<any>;
  private listSubscription: Subscription;

  public groups: Observable<Group[]>;

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private windowSize: WindowSizeService,
  ) {
    this.columnCount = this.windowSize.gridColumnCount;
  }

  ngOnInit() {
    this.user = this.route.snapshot.data['user'];
    this.list = this.groupService.listUserGroups(this.user.uid)
      .map((groups: string[]) => {
        return _.map(groups, g => {
          return {$key: g};
        });
      }).map((groups: any[]) => {
        groups.forEach((group) => {
          group.details = this.groupService.get(group.$key)
            .map((details) => {
              details.isOwner = details.owner === this.user.uid;
              return details;
            });
        });
        return groups;
      });

    this.listSubscription = this.list.subscribe((list) => {
      const memberKeys = _.map(list, (g: any) => g.$key);
      this.groups = this.groupService.list().map((groups: any[]) => {
        return _.filter(groups, (group: any) => {
          return !_.find(memberKeys, (k: string) => group.$key === k);
        });
      });
    });
  }

  ngOnDestroy() {
    this.listSubscription.unsubscribe();
  }

}
