import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ScheduleService {

  constructor(
    private af: AngularFire
  ) { }

  listSchedules(userId: string): Observable<any[]> {
    return this.af.database.list(`/schedules/${userId}`, {
      query: {
        orderByChild: 'startDate'
      }
    }).map((list) => {
      return list.reverse();
    });
  }
}
