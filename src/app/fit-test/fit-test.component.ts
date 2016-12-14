import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

import * as moment from 'moment';

@Component({
  selector: 'app-fit-test',
  templateUrl: './fit-test.component.html',
  styleUrls: ['./fit-test.component.scss']
})
export class FitTestComponent implements OnInit {
  private fitTest: FirebaseListObservable<any>;
  private questionLists: any;

  private userId: string;
  private scheduleId: string;
  private date = moment().startOf('day').format('YYYY-MM-DD');

  public answers: any;
  public selectedTab: number = 0;

  constructor(
    private af: AngularFire,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.userId = this.route.snapshot.data['user'].uid;
    this.route.params.forEach((params: Params) => {
      this.scheduleId = params['scheduleId'];
      if (params['date']) {
        this.date = moment(params['date']).startOf('day').format('YYYY-MM-DD');
      }
    });

    this.fitTest = this.af.database.list('fitTest', {
      query: {
        orderByChild: 'order'
      }
    });

    // Load each child question list
    this.fitTest.take(1).forEach((groups: any[]) => {
      this.questionLists = {};
      this.answers = {
        points: 0,
        pointsPossible: 0,
        groups: {}
      };
      groups.forEach((group)=> {
        this.answers.groups[group.$key] = {
          points: 0,
          pointsPossible: 0,
          questions: {}
        };
        this.questionLists[group.$key] = this.af.database.list(`fitTest/${group.$key}/questions`, {
          query: { orderByChild: 'order' }
        })
        this.questionLists[group.$key].subscribe((questions: any[]) => {
          questions.forEach((question)=> {
            this.answers.pointsPossible += 5;
            this.answers.groups[group.$key].pointsPossible += 5;
          });
        })
      });
    });
  }

  updatePoints() {
    let total = 0;
    Object.keys(this.answers.groups).forEach((group) => {
      let groupTotal = 0;
      Object.keys(this.answers.groups[group].questions).forEach((question)=> {
        this.answers.groups[group].questions[question] = +this.answers.groups[group].questions[question] || 0;
        let val = this.answers.groups[group].questions[question];
        total += val;
        groupTotal += val;
      });
      this.answers.groups[group].points = groupTotal;
    });
    this.answers.points = total;
  }

  submit() {
    let entry = this.af.database.object(`/entries/${this.scheduleId}/fitTest/${this.date}`);
    entry.set(this.answers).then(() => {
      this.router.navigate(['/track', this.scheduleId, this.date]);
    });
  }

}
