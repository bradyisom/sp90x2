import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';

import * as _ from 'lodash';
import * as moment from 'moment';

export interface Schedule {
  programTitle: string;
  program: string;
  startDate: string;
  endDate?: string;
  group?: string;
  points?: number;
  pointsPossible?: number;
  tasks?: any;
}

@Injectable()
export class ScheduleService {
  private tasks: any[];

  constructor(
    private af: AngularFire
  ) {
    this.af.database.object('/tasks').subscribe((tasks) => this.tasks = tasks);
  }

  listSchedules(userId: string): Observable<any[]> {
    return this.af.database.list(`/schedules/${userId}`, {
      query: {
        orderByChild: 'startDate'
      }
    }).map((list) => {
      return list.reverse();
    });
  }

  create(userId: string, schedule: Schedule) {
    // Calculate all of the tasks
    const orders = {};
    const tasks = {
      daily: {},
      monthly: {}
    };
    let pointsPossible = 0;
    const startDate = moment(schedule.startDate);
    const endDate = moment(startDate).add(89, 'days').endOf('day');
    moment.range(startDate, endDate).by('days', (day) => {
      Object.keys(schedule.tasks).forEach((taskId) => {
        const interval = schedule.tasks[taskId];
        const task = this.tasks[taskId];
        if (interval === 'monthly') {
          if (day.isSame(startDate, 'day') || day.date() === 1) {
            const key = day.format('YYYY-MM');
            tasks.monthly[key] = tasks.monthly[key] || {};
            tasks.monthly[key][taskId] = {
              points: task.points,
              finished: false
            };
            pointsPossible += task.points;
          }
        } else {
          const weekday = day.format('dd');
          if (interval === 'daily' ||
              interval.split(',').some((value: string) => value === weekday)) {
            const key = day.format('YYYY-MM-DD');
            tasks.daily[key] = tasks.daily[key] || {};
            tasks.daily[key][taskId] = {
              points: task.points,
              finished: false
            };
            pointsPossible += task.points;
            if (task.subTasks) {
              const order = orders[taskId] = orders[taskId] || 0;
              tasks.daily[key][taskId].order = order;
              orders[taskId]++;
            }
          }
        }
      });
    });
    const newValue = _.extend(schedule, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      points: 0,
      pointsPossible: pointsPossible
    });

    let scheduleId: string;
    return this.af.database.list(`/schedules/${userId}`).push(newValue)
      .then((result: any) => {
        scheduleId = result.key;
        const entriesObj = this.af.database.object(`/entries/${scheduleId}`);
        return entriesObj.set(tasks);
      }).then(() => {
        return scheduleId;
      });
  }

  delete(userId: string, scheduleId: string) {
    const schedule = this.af.database.object(`/schedules/${userId}/${scheduleId}`);
    return schedule.first().toPromise().then((s) => {
      if (s.group) {
        const groupUser = this.af.database.object(`/groupUsers/${s.group}/${userId}`);
        return groupUser.first().toPromise().then((existing) => {
          const newVal = _.omitBy(_.omit(existing, 'schedule', 'points', 'pointsPossible'), (val, key) => {
            return key.startsWith('$');
          });
          return groupUser.set(newVal);
        });
      } else {
        return Promise.resolve();
      }
    }).then(() => {
      return this.af.database.object(`/entries/${scheduleId}`).remove();
    }).then(() => {
      return schedule.remove();
    });
  }

  updateEntry(userId: string, scheduleId: string, type: 'daily'|'monthly',
            date: string, taskId: string, taskPoints: number, val: boolean) {
    let dateString: string;
    if (type === 'monthly') {
      dateString = moment(date).format('YYYY-MM');
    } else {
      dateString = moment(date).format('YYYY-MM-DD');
    }
    const scheduleRef = this.af.database.object(`/schedules/${userId}/${scheduleId}`);
    let points: number;
    let groupId: string;
    return this.af.database.object(`/entries/${scheduleId}/${type}/${dateString}/${taskId}`).update({
      finished: val
    }).then(() => {
      return scheduleRef.first().toPromise();
    }).then((schedule) => {
      if (val) {
        points = schedule.points + taskPoints;
      } else {
        points = schedule.points - taskPoints;
      }
      groupId = schedule.group;
      return scheduleRef.update({
        points: points
      });
    }).then(() => {
      if (groupId) {
        return this.af.database.object(`/groupUsers/${groupId}/${userId}`).update({
          points: points
        });
      } else {
        return Promise.resolve();
      }
    });
  }
}
