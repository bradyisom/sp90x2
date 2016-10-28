import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-edit-schedule',
  templateUrl: './edit-schedule.component.html',
  styleUrls: ['./edit-schedule.component.scss']
})
export class EditScheduleComponent implements OnInit {
  scheduleId: string;
  public schedule: FirebaseObjectObservable<any>;
  userId: string;

  public editForm: FormGroup;

  constructor(
    private route: ActivatedRoute, private router: Router,
    private auth: AuthService, private af: AngularFire
  ) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {    
      this.scheduleId = params['id'];
    });

    this.editForm = new FormGroup({
      programTitle: new FormControl('SP90X Classic', Validators.required),
      startDate: new FormControl(moment().format('YYYY-MM-DD'), Validators.required),
      endDate: new FormControl(moment().add(90, 'days').format('YYYY-MM-DD'), Validators.required)
    });

    this.auth.user.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        if(this.scheduleId) {
          this.schedule = this.af.database.object(`/schedules/${this.userId}/${this.scheduleId}`)
          this.schedule.subscribe((schedule) => {
            this.editForm.setValue(
              _.pick(schedule, 'programTitle', 'startDate', 'endDate')
            )
            return true;
          });
        }
      }
      else {
        this.userId = null;
      }
    });

  }

  save() {
    console.log('save', this.editForm);
    if (this.editForm.status !== 'VALID') {
      return;
    }
    let newValue = _.extend({
      tasks: {
        BOFM90: "daily",
        DTG: "Su",
        FASTING: "monthly",
        GC: "Mo,Th",
        JOURNAL: "daily",
        MAG: "Tu,Fr",
        PMG: "daily",
        PONDER: "daily",
        PRAY: "daily",
        SERVICE: "daily",
        'SM-BOFM': "We,Sa",
        TEMPLE: "monthly"
      }
    }, this.editForm.value);

    if (this.schedule) {
      this.schedule.set(newValue);
    }
    else {
      let schedules = this.af.database.list(`/schedules/${this.userId}`);
      schedules.push(newValue);
    }

    this.router.navigate(['/schedules']);
  }

}
