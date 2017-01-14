/* tslint:disable:no-unused-variable */

import { TestBed, async, fakeAsync, tick, inject } from '@angular/core/testing';
import { AngularFire } from 'angularfire2';
import { GroupService, Group } from './group.service';
import { Observable } from 'rxjs/Observable';

import * as _ from 'lodash';

describe('GroupService', () => {

  let service: GroupService;
  let group: Group;
  let user: any;

  let rejectRemoveGroup: boolean;

  const pushGroupSpy = jasmine.createSpy('push group', () => {
    return Promise.resolve({
      key: 'G1'
    });
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
        const result: any = Observable.of({
          name: 'Group One'
        });
        result.remove = removeGroupSpy;
        result.update = updateGroupSpy;
        return result;
      }).and.callThrough(),
    }
  };

  beforeEach(() => {
    mockAngularFire.database.list.calls.reset();
    mockAngularFire.database.object.calls.reset();
    pushGroupSpy.calls.reset();
    updateGroupSpy.calls.reset();
    removeGroupSpy.calls.reset();
    updateUserGroupsSpy.calls.reset();
    removeUserGroupsSpy.calls.reset();
    updateGroupUsersSpy.calls.reset();
    removeGroupUsersSpy.calls.reset();

    rejectRemoveGroup = false;

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

    it('should reject on error', fakeAsync(() => {
      rejectRemoveGroup = true;
      let message = '';
      service.delete('G1').catch((_message) => message = _message);
      tick();
      expect(message).toBe('Remove group error');
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

});
