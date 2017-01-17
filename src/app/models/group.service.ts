import { Injectable } from '@angular/core';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import * as _ from 'lodash';

export interface Group {
  name: string;
  description: string;
  public: boolean;
  owner: string;
  imageUrl: string;
  schedule: string;
  startDate: string;
  endDate: string;
  programTitle: string;
  program: string;
  tasks: any;
};

@Injectable()
export class GroupService {

  constructor(
    private af: AngularFire
  ) { }

  create(group: Group, owner: any): firebase.Promise<any> {
    let groupId: string;
    return this.af.database.list('/groups').push(group)
      .then((result: any) => {
        groupId = result.key;
        const groupEntry = {};
        groupEntry[result.key] = true;
        return this.af.database.object(`/users/${owner.uid}/groups`).update(groupEntry);
      }).then(() => {
        const userEntry = {};
        userEntry[owner.uid] = {
          displayName: owner.displayName,
          email: owner.email,
          avatar: owner.avatar
        };
        return this.af.database.object(`/groupUsers/${groupId}`).update(userEntry);
      }).then(() => {
        return this.setSchedule(owner.uid, groupId, group.schedule);
      });
  }

  get(groupId: string): FirebaseObjectObservable<any> {
    return this.af.database.object(`/groups/${groupId}`);
  }

  update(groupId: string, group: Group): firebase.Promise<void> {
    return this.af.database.object(`/groups/${groupId}`).update(group).then(() => {
      return this.setSchedule(group.owner, groupId, group.schedule);
    });
  }

  delete(groupId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const users = this.af.database.list(`/groupUsers/${groupId}`);
      return users.map((groupUsers) => {
        const promises = [];
        for (const userId of _.map(groupUsers, (user: any) => user.$key)) {
          promises.push(this.af.database.object(`/users/${userId}/groups/${groupId}`).remove());
        }
        return Promise.all(promises).then(() => {
          return users.remove();
        }).then(() => {
          return this.af.database.object(`/groups/${groupId}`).remove();
        }).then(() => {
          resolve();
        }).catch((err) => {
          reject(err);
        });
      }).first().subscribe();
    });
  }

  list(options?: any): FirebaseListObservable<Group[]> {
    if (!options) {
      options = {
        query: {
          orderByKey: true,
        }
      };
    }
    return this.af.database.list(`/groups`, options);
  }

  listUserGroups(userId: string): Observable<string[]> {
    return this.af.database.object(`/users/${userId}/groups`)
      .map((entry: any): string[] => {
        return _.filter(_.keys(entry), e => !e.startsWith('$'));
      });
  }

  listGroupMembers(groupId: string): FirebaseListObservable<any> {
    return this.af.database.list(`/groupUsers/${groupId}`);
  }

  join(user: any, groupId: string): firebase.Promise<any> {
    const groupEntry = {};
    groupEntry[groupId] = true;
    return this.af.database.object(`/users/${user.uid}/groups`).update(groupEntry).then(() => {
      const userEntry = {};
      userEntry[user.uid] = {
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar
      };
      return this.af.database.object(`/groupUsers/${groupId}`).update(userEntry);
    });
  }

  leave(userId: string, groupId: string): firebase.Promise<any> {
    const groupEntry = {};
    groupEntry[groupId] = true;
    return this.af.database.object(`/groupUsers/${groupId}/${userId}`).remove().then(() => {
      return this.af.database.object(`/users/${userId}/groups/${groupId}`).remove();
    });
  }

  setSchedule(userId: string, groupId: string, scheduleId: string) {
    const schedule = this.af.database.object(`/schedules/${userId}/${scheduleId}`);
    return schedule.first().toPromise().then((s) => {
      return this.af.database.object(`/groupUsers/${groupId}/${userId}`).update({
        schedule: scheduleId,
        points: s.points,
        pointsPossible: s.pointsPossible,
      }).then(() => {
        return schedule.update({
          group: groupId
        });
      });
    });
  }

}
