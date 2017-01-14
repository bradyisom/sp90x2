import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { GroupService, Group } from '../models/group.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  public user: any;
  public list: Observable<any>;

  public groups: FirebaseListObservable<Group[]>;

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
  ) { }

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

    this.groups = this.groupService.list();
  }

}
