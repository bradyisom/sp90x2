import { ViewChild, ElementRef, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { GroupService, Group } from '../models/group.service';
import { ScheduleService } from '../models/schedule.service';
import { ConfirmService } from '../confirm.service';
import { ErrorService } from '../error.service';
import { emojis } from '../emojify.pipe';

import * as _ from 'lodash';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  public group: Observable<Group>;
  public members: Observable<any>;
  public isOwner: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isMember: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public hasSchedule: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public hasMoreMessages: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public messages: Observable<any>;

  private groupSnapshot: Group;
  private groupId: string;
  private user: any;

  private firstMessageKey: string;
  private messagePageSize = 10;

  private messageLimit: BehaviorSubject<number> = new BehaviorSubject<number>(this.messagePageSize);

  public emojis = emojis;

  @ViewChild('message') messageField: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private groups: GroupService,
    private schedules: ScheduleService,
    private error: ErrorService,
    private confirm: ConfirmService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit() {

    this.groupId = this.route.snapshot.params['id'];
    this.user = this.route.snapshot.data['user'];

    this.group = this.groups.get(this.groupId).map((group) => {
      this.groupSnapshot = group;
      this.isOwner.next(group.owner === this.user.uid);
      this.changeDetector.detectChanges();
      return group;
    });

    this.members = this.groups.listGroupMembers(this.groupId).map((members) => {
      const memberEntry = _.find(members, (m: any) => m.$key === this.user.uid);
      this.isMember.next(!!memberEntry);
      this.hasSchedule.next(!!(memberEntry && memberEntry.schedule));
      this.changeDetector.detectChanges();
      if (this.isMember.value) {
        this.loadMessages();
      }
      return members;
    });
  }

  private loadMessages() {
    this.groups.listMessages(this.groupId, {
      query: {
        orderByKey: true,
        limitToFirst: 1
      }
    }).first().subscribe((list) => {
      if (list.length) {
        this.firstMessageKey = list[0].$key;
      } else {
        this.firstMessageKey = '';
      }
    });

    this.messages = this.groups.listMessages(this.groupId, {
      query: {
        orderByKey: true,
        limitToLast: this.messageLimit
      }
    }).map((messages: any[]) => {
      this.hasMoreMessages.next(!!(messages.length && messages[0].$key !== this.firstMessageKey));
      return messages.reverse();
    });
  }

  loadMore() {
    this.messageLimit.next(this.messageLimit.value + this.messagePageSize);
  }

  getKey(message: any) {
    return message.$key;
  }

  join() {
    this.groups.join(this.user, this.groupId).then(() => {}).catch((err) => {
      this.error.show(err, 'Unable to join group');
    });
  }

  leave() {
    this.groups.leave(this.user.uid, this.groupId).then(() => {}).catch((err) => {
      this.error.show(err, 'Unable to leave group');
    });
  }

  createSchedule() {
    this.schedules.create(this.user.uid, {
      programTitle: this.groupSnapshot.name,
      program: this.groupSnapshot.program,
      startDate: this.groupSnapshot.startDate,
      imageUrl: this.groupSnapshot.imageUrl,
      group: this.groupId,
      tasks: this.groupSnapshot.tasks,
    }).then((scheduleId) => {
      return this.groups.setSchedule(this.user.uid, this.groupId, scheduleId);
    }).catch((err) => {
      this.error.show(err, 'Unable to create schedule');
    });
  }

  insertEmoji(emoji: string) {
    this.messageField.nativeElement.value = this.messageField.nativeElement.value || '';
    this.messageField.nativeElement.value += emoji;
  }

  postMessage(message: string) {
    if (!message || !message.length) {
      return;
    }
    this.groups.postMessage(this.user, this.groupId, message);
  }

  deleteMessage(message: any) {
    this.confirm.show(
      'Are you sure you want to delete this message?',
      'Delete Message',
      'warn'
    ).afterClosed().first().subscribe(result => {
      if (result === 'confirm') {
        this.groups.deleteMessage(this.groupId, message.$key);
      }
    });
  }

}
