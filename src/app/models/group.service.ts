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
      });
  }

  get(groupId: string): FirebaseObjectObservable<any> {
    return this.af.database.object(`/groups/${groupId}`);
  }

  update(groupId: string, group: Group): firebase.Promise<void> {
    return this.af.database.object(`/groups/${groupId}`).update(group);
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

  list(): FirebaseListObservable<Group[]> {
    return this.af.database.list(`/groups`, {
      query: {
        orderByKey: true,
      }
    });
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

}
