import { Injectable, Inject } from '@angular/core';
import { AngularFire, FirebaseApp, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import * as firebase from 'firebase';
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
    private af: AngularFire,
    @Inject(FirebaseApp) private firebase: any,
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
      }).then(() => {
        return groupId;
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
      let groupRef: FirebaseObjectObservable<Group>;
      const users = this.af.database.list(`/groupUsers/${groupId}`);
      let ownerId = '';
      return users.map((groupUsers) => {
        const promises = [];
        for (const userId of _.map(groupUsers, (user: any) => user.$key)) {
          promises.push(this.af.database.object(`/users/${userId}/groups/${groupId}`).remove());
        }
        return Promise.all(promises).then(() => {
          return users.remove();
        }).then(() => {
          groupRef = this.af.database.object(`/groups/${groupId}`);
          return (<Promise<Group>>groupRef.first().toPromise());
        }).then((group: Group) => {
          ownerId = group.owner;
          if (group.schedule) {
            return this.af.database.object(`/schedules/${group.owner}/${group.schedule}/group`).remove();
          } else {
            return Promise.resolve();
          }
        }).then(() => {
          const storageRef = this.firebase.storage().ref().child(`user/${ownerId}/${groupId}/thumbnail.png`);
          return storageRef.delete().catch(/* istanbul ignore next */(err) => {});
        }).then(() => {
          return groupRef.remove();
        }).then(() => {
          resolve();
        }).catch(/* istanbul ignore next */(err) => {
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

  deleteMessage(groupId: string, messageId: string) {
    return this.af.database.object(`/groupMessages/${groupId}/${messageId}`).remove();
  }

  postMessage(user: any, groupId: string, message: string) {
    return this.af.database.list(`/groupMessages/${groupId}`).push({
      userId: user.uid,
      avatar: user.avatar,
      displayName: user.displayName,
      date: firebase.database.ServerValue.TIMESTAMP,
      message: message.replace(/\n/g, '<br>'),
    });
  }

  listMessages(groupId: string, options?: any) {
    return this.af.database.list(`/groupMessages/${groupId}`, options);
  }

}
