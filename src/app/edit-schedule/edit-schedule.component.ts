import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { Observable } from 'rxjs';
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
  userId: string;
  scheduleId: string;
  public editForm: FormGroup;
  public schedule: FirebaseObjectObservable<any>;
  public programs: FirebaseListObservable<any>;
  public filteredTasks: Observable<any>;
  programTasks: FirebaseListObservable<any>;
  tasks: FirebaseListObservable<any>;

  constructor(
    private route: ActivatedRoute, private router: Router,
    private auth: AuthService, private af: AngularFire
  ) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      this.scheduleId = params['id'];
    });

    let programControl = new FormControl('', Validators.required);
    programControl.valueChanges.subscribe((programId: string) => this.programChange(programId));

    this.editForm = new FormGroup({
      programTitle: new FormControl('SP90X Classic', Validators.required),
      startDate: new FormControl(moment().format('YYYY-MM-DD'), Validators.required),
      endDate: new FormControl(moment().add(90, 'days').format('YYYY-MM-DD'), Validators.required),
      program: programControl
    });

    this.programs = this.af.database.list('/programs');
    this.tasks = this.af.database.list('/tasks', {
      query: {
        orderByChild: 'title'
      }
    });

    this.auth.user.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        if (this.scheduleId) {
          this.schedule = this.af.database.object(`/schedules/${this.userId}/${this.scheduleId}`)
          this.schedule.subscribe((schedule) => {
            this.editForm.setValue({
              programTitle: schedule.programTitle,
              startDate: moment(schedule.startDate).format('YYYY-MM-DD'),
              endDate: moment(schedule.endDate).format('YYYY-MM-DD'),
              program: schedule.program || ''
            });
            return true;
          });
        }
      }
      else {
        this.userId = null;
      }
    });

  }

  programChange(programId: string) {
    this.programTasks = this.af.database.list(`/programs/${programId}/tasks`);
    this.programTasks.subscribe(() => {
      this.filteredTasks = this.tasks.withLatestFrom(this.programTasks)
        .map(([tasks, programTasks]) => {
          return _.filter(tasks, (t:any)=> {
            return !!_.find(programTasks, {$key: t.$key});
          });
        });
    });
  }

  save() {
    // console.log('save', this.editForm.value);
    if (this.editForm.invalid) {
      return;
    }
    let newValue = _.extend({}, this.editForm.value, {
      startDate: moment(this.editForm.value.startDate, 'YYYY-MM-DD').toISOString(),
      endDate: moment(this.editForm.value.endDate, 'YYYY-MM-DD').toISOString(),
    });

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
