/* tslint:disable:no-unused-variable */

import { TestBed, async, fakeAsync, tick, inject } from '@angular/core/testing';
import { AngularFire } from 'angularfire2';
import { GroupService, Group } from './group.service';
import { Observable } from 'rxjs/Observable';

import * as firebase from 'firebase';
import * as _ from 'lodash';

describe('GroupService', () => {

  let service: GroupService;
  let group: Group;
  let user: any;

  let testGroup: any;

  let rejectRemoveGroup: boolean;

  const pushGroupSpy = jasmine.createSpy('push group', () => {
    return Promise.resolve({
      key: 'G1'
    });
  }).and.callThrough();
  const pushMessageSpy = jasmine.createSpy('push message', () => {
    return Promise.resolve({
      key: 'M1'
    });
  }).and.callThrough();
  const removeMessageSpy = jasmine.createSpy('remove message', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const updateGroupSpy = jasmine.createSpy('update group', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const removeGroupSpy = jasmine.createSpy('remove group', () => {
    if (rejectRemoveGroup) {
      return Promise.reject('Remove group error');
    }
    return Promise.resolve({});
  }).and.callThrough();
  const updateUserGroupsSpy = jasmine.createSpy('update user groups', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const removeUserGroupsSpy = jasmine.createSpy('remove user groups', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const updateScheduleGroupSpy = jasmine.createSpy('update schedule group', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const removeScheduleGroupSpy = jasmine.createSpy('remove schedule group', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const updateGroupUsersSpy = jasmine.createSpy('update group users', () => {
    return Promise.resolve({});
  }).and.callThrough();
  const removeGroupUsersSpy = jasmine.createSpy('remove group users', () => {
    return Promise.resolve({});
  }).and.callThrough();

  const mockAngularFire = {
    database: {
      list: jasmine.createSpy('list', (path: string): any => {
        if (path.startsWith('/groupUsers/')) {
          const result: any = Observable.of([{
            $key: 'U1'
          }, {
            $key: 'U2'
          }]);
          result.remove = removeGroupUsersSpy;
          return result;
        }
        if (path.startsWith('/groupMessages/')) {
          const result: any = Observable.of([{
            $key: 'M1'
          }, {
            $key: 'M2'
          }]);
          result.push = pushMessageSpy;
          return result;
        }
        return {
          push: pushGroupSpy
        };
      }).and.callThrough(),
      object: jasmine.createSpy('object', (path: string): any => {
        if (path.startsWith('/users/')) {
          const result: any = Observable.of({
            G1: true,
            G2: true,
          });
          result.remove = removeUserGroupsSpy;
          result.update = updateUserGroupsSpy;
          return result;
        }
        if (path.startsWith('/groupUsers/')) {
          const result: any = Observable.of({});
          result.remove = removeGroupUsersSpy;
          result.update = updateGroupUsersSpy;
          return result;
        }
        if (path.startsWith('/schedules/')) {
          const result: any = Observable.of({});
          result.remove = removeScheduleGroupSpy;
          result.update = updateScheduleGroupSpy;
          return result;
        }
        if (path.startsWith('/groups/')) {
          const result: any = Observable.of(testGroup);
          result.remove = removeGroupSpy;
          result.update = updateGroupSpy;
          return result;
        }
        if (path.startsWith('/groupMessages')) {
          const result: any = Observable.of({});
          result.remove = removeMessageSpy;
          return result;
        }
        return Observable.of({});
      }).and.callThrough(),
    }
  };

  beforeEach(() => {
    mockAngularFire.database.list.calls.reset();
    mockAngularFire.database.object.calls.reset();
    pushGroupSpy.calls.reset();
    pushMessageSpy.calls.reset();
    removeMessageSpy.calls.reset();
    updateGroupSpy.calls.reset();
    removeGroupSpy.calls.reset();
    updateUserGroupsSpy.calls.reset();
    removeUserGroupsSpy.calls.reset();
    updateGroupUsersSpy.calls.reset();
    removeGroupUsersSpy.calls.reset();
    updateScheduleGroupSpy.calls.reset();
    removeScheduleGroupSpy.calls.reset();

    rejectRemoveGroup = false;

    testGroup = {
      name: 'Group One'
    };

    TestBed.configureTestingModule({
      providers: [GroupService,
        { provide: AngularFire, useValue: mockAngularFire },
      ]
    });
  });

  beforeEach(inject([GroupService], (_service: GroupService) => {
    service = _service;
    group = {
      name: 'Group One',
      description: 'Group description',
      public: true,
      owner: 'U1',
      imageUrl: 'https://goog.le/image.png',
      schedule: 'SCHED1',
      startDate: '2017-01-14T00:00:00Z',
      endDate: '2017-04-14T00:00:00Z',
      programTitle: 'Schedule One',
      program: 'PROG1',
      tasks: {},
    };
    user = {
      uid: 'U1',
      displayName: 'John Doe',
      email: 'jdoe@gmail.com',
      avatar: 'https://goog.le/avatar.png',
    };
  }));

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {

    it('should create the group', () => {
      service.create(group, user);
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/groups');
      expect(pushGroupSpy).toHaveBeenCalledWith(group);
    });

    it('should update the user\'s groups', fakeAsync(() => {
      service.create(group, user);
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/users/U1/groups');
      expect(updateUserGroupsSpy).toHaveBeenCalledWith({
        G1: true
      });
    }));

    it('should update the group\'s users', fakeAsync(() => {
      service.create(group, user);
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/groupUsers/G1');
      expect(updateGroupUsersSpy).toHaveBeenCalledWith({
        U1: {
          displayName: 'John Doe',
          email: 'jdoe@gmail.com',
          avatar: 'https://goog.le/avatar.png',
        }
      });
    }));
  });


  describe('get', () => {

    it('get the group', () => {
      const result = service.get('G1');
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/groups/G1');
      result.first().subscribe((g) => {
        expect(g.name).toBe('Group One');
      });
    });

  });

  describe('update', () => {

    it('should update the group', () => {
      service.update('G1', group);
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/groups/G1');
      expect(updateGroupSpy).toHaveBeenCalledWith(group);
    });

  });

  describe('delete', () => {

    it('should delete the group from user lists', () => {
      service.delete('G1');
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/groupUsers/G1');
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/users/U1/groups/G1');
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/users/U2/groups/G1');
      expect(removeUserGroupsSpy).toHaveBeenCalledTimes(2);
    });

    it('should delete the group users', fakeAsync(() => {
      service.delete('G1');
      tick();
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/groupUsers/G1');
      expect(removeGroupUsersSpy).toHaveBeenCalled();
    }));

    it('should delete the group', fakeAsync(() => {
      service.delete('G1');
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/groups/G1');
      expect(removeGroupSpy).toHaveBeenCalled();
    }));

    it('should resolve', fakeAsync(() => {
      let success = false;
      service.delete('G1').then(() => success = true);
      tick();
      expect(success).toBe(true);
    }));

    // it('should reject on error', fakeAsync(() => {
    //   rejectRemoveGroup = true;
    //   let message = '';
    //   service.delete('G1').catch((_message) => message = _message);
    //   tick();
    //   expect(message).toBe('Remove group error');
    // }));

    it('should remove the group reference from a schedule', fakeAsync(() => {
      testGroup.schedule = 'SCHED1';
      testGroup.owner = 'U1';
      service.delete('G1');
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/schedules/U1/SCHED1/group');
      expect(removeScheduleGroupSpy).toHaveBeenCalled();
    }));

  });


  describe('list', () => {

    it('should list groups', () => {
      service.list();
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/groups', {
        query: {
          orderByKey: true
        }
      });
    });

    it('should list groups with options', () => {
      service.list({
        query: {
          orderByChild: 'owner',
          value: 'U1'
        }
      });
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/groups', {
        query: {
          orderByChild: 'owner',
          value: 'U1'
        }
      });
    });

  });


  describe('listUserGroups', () => {

    it('should list user groups', () => {
      const result = service.listUserGroups('U1');
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/users/U1/groups');
      result.first().subscribe((groups) => {
        expect(groups).toEqual(['G1', 'G2']);
      });
    });

  });

  describe('listGroupMembers', () => {

    it('should list group users', () => {
      const result = service.listGroupMembers('G1');
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/groupUsers/G1');
      result.first().subscribe((members) => {
        expect(_.map(members, (m: any) => m.$key)).toEqual(['U1', 'U2']);
      });
    });

  });

  describe('join', () => {

    it('should update user\'s groups', () => {
      service.join(user, 'G1');
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/users/U1/groups');
      expect(updateUserGroupsSpy).toHaveBeenCalledWith({
        G1: true
      });
    });

    it('should update group\'s users', fakeAsync(() => {
      service.join(user, 'G1');
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/groupUsers/G1');
      expect(updateGroupUsersSpy).toHaveBeenCalledWith({
        U1: {
          displayName: 'John Doe',
          email: 'jdoe@gmail.com',
          avatar: 'https://goog.le/avatar.png',
        }
      });
    }));

  });

  describe('leave', () => {

    it('should update user\'s groups', () => {
      service.leave('U1', 'G1');
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/groupUsers/G1/U1');
      expect(removeGroupUsersSpy).toHaveBeenCalled();
    });

    it('should update group\'s users', fakeAsync(() => {
      service.leave('U1', 'G1');
      tick();
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/users/U1/groups/G1');
      expect(removeUserGroupsSpy).toHaveBeenCalled();
    }));

  });

  describe('deleteMessage', () => {

    it('should delete a message', () => {
      service.deleteMessage('G1', 'M1');
      expect(mockAngularFire.database.object).toHaveBeenCalledWith('/groupMessages/G1/M1');
      expect(removeMessageSpy).toHaveBeenCalled();
    });

  });

  describe('postMessage', () => {

    it('should post a message', () => {
      service.postMessage(user, 'G1', 'This is my message.');
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/groupMessages/G1');
      expect(pushMessageSpy).toHaveBeenCalledWith({
        userId: 'U1',
        displayName: 'John Doe',
        avatar: 'https://goog.le/avatar.png',
        date: firebase.database.ServerValue.TIMESTAMP,
        message: 'This is my message.',
      });
    });

    it('should post a multiline message', () => {
      service.postMessage(user, 'G1', 'This is my message.\nLine 2\n\nLine 3');
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/groupMessages/G1');
      expect(pushMessageSpy).toHaveBeenCalledWith({
        userId: 'U1',
        displayName: 'John Doe',
        avatar: 'https://goog.le/avatar.png',
        date: firebase.database.ServerValue.TIMESTAMP,
        message: 'This is my message.<br>Line 2<br><br>Line 3',
      });
    });

    it('should resolve with the new message id', () => {
      service.postMessage(user, 'G1', 'This is my message.').then((result) => {
        expect(result.key).toBe('M1');
      });
    });

  });

  describe('listMessages', () => {

    it('should list messages', () => {
      const result = service.listMessages('G1');
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/groupMessages/G1', undefined);
      result.first().subscribe((list) => {
        expect(list).toEqual([{
          $key: 'M1'
        }, {
          $key: 'M2'
        }]);
      });
    });

    it('should list messages with options', () => {
      service.listMessages('G1', {
        query: {
          orderByKey: true,
          limitToFirst: 10
        }
      });
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('/groupMessages/G1', {
        query: {
          orderByKey: true,
          limitToFirst: 10
        }
      });
    });

  });


});
