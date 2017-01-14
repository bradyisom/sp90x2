/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { GroupService, Group } from '../models/group.service';

import { GroupsComponent } from './groups.component';

describe('GroupsComponent', () => {
  let component: GroupsComponent;
  let fixture: ComponentFixture<GroupsComponent>;

  let route: ActivatedRoute;

  const mockGroups = {
    get: jasmine.createSpy('get group', (groupId: string) => {
      if (groupId === 'G2') {
        return Observable.of({
          name: 'Group Two',
          owner: 'U2',
          imageUrl: 'assets/logo-noback.png',
        });
      }
      return Observable.of({
        name: 'Group One',
        owner: 'U1',
        imageUrl: 'assets/logo-noback.png',
      });
    }).and.callThrough(),
    listUserGroups: jasmine.createSpy('listUserGroups', () => {
      return Observable.of([
        'G1', 'G2'
      ]);
    }).and.callThrough(),
    list: jasmine.createSpy('list groups', () => {
      return Observable.of([{
        $key: 'G1',
        name: 'Group One',
        imageUrl: 'assets/logo-noback.png',
      }, {
        $key: 'G3',
        name: 'Group Three',
        imageUrl: 'assets/logo-noback.png',
      }]);
    }).and.callThrough(),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        MaterialModule.forRoot(),
      ],
      providers: [
        { provide: GroupService, useValue: mockGroups },
      ],
      declarations: [ GroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mockGroups.get.calls.reset();
    mockGroups.list.calls.reset();
    mockGroups.listUserGroups.calls.reset();

    route = TestBed.get(ActivatedRoute);
    route.snapshot.data = {
      user: {
        uid: 'U1'
      }
    };

    fixture = TestBed.createComponent(GroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the user', () => {
    expect(component.user).toEqual({
      uid: 'U1'
    });
  });

  it('should list user groups', () => {
    expect(mockGroups.listUserGroups).toHaveBeenCalledWith('U1');
    expect(mockGroups.get).toHaveBeenCalledWith('G1');
    expect(mockGroups.get).toHaveBeenCalledWith('G2');
    component.list.first().subscribe((list) => {
      expect(list).toEqual([
        jasmine.objectContaining({
          $key: 'G1',
        }),
        jasmine.objectContaining({
          $key: 'G2',
        }),
      ]);
      list[0].details.first().subscribe((g) => {
        expect(g).toEqual({
          name: 'Group One',
          owner: 'U1',
          isOwner: true,
          imageUrl: 'assets/logo-noback.png',
        });
      });
      list[1].details.first().subscribe((g) => {
        expect(g).toEqual({
          name: 'Group Two',
          owner: 'U2',
          isOwner: false,
          imageUrl: 'assets/logo-noback.png',
        });
      });
    });
  });


  it('should list all groups', () => {
    expect(mockGroups.list).toHaveBeenCalled();
    component.groups.first().subscribe((list) => {
      expect(list).toEqual([{
        $key: 'G1',
        name: 'Group One',
        imageUrl: 'assets/logo-noback.png',
      }, {
        $key: 'G3',
        name: 'Group Three',
        imageUrl: 'assets/logo-noback.png',
      }]);
    });
  });


});
