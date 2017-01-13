import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/zip';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-fit-test',
  templateUrl: './fit-test.component.html',
  styleUrls: ['./fit-test.component.scss']
})
export class FitTestComponent implements OnInit {
  public fitTest: FirebaseListObservable<any>;
  public questionLists: any;
  private entry: FirebaseObjectObservable<any>;

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
      this.date = moment(params['date']).startOf('day').format('YYYY-MM-DD');
    });

    this.fitTest = this.af.database.list('fitTest', {
      query: {
        orderByChild: 'order'
      }
    });

    this.entry = this.af.database.object(`/entries/${this.scheduleId}/fitTest/${this.date}`);

    // Load each child question list
    Observable.zip(this.fitTest, this.entry).take(1).forEach((values: any[]) => {
      const groups: any[] = values[0];
      const existing: any = values[1];

      this.questionLists = {};

      this.answers = {
        points: 0,
        pointsPossible: 0,
        groups: {}
      };

      groups.forEach((group) => {
        const answerGroup = this.answers.groups[group.$key] = {
          points: 0,
          pointsPossible: 0,
          questions: {}
        };
        const questionList: any[] = [];
        Object.keys(group.questions).forEach((questionKey: string) => {
          const question = group.questions[questionKey];
          question.$key = questionKey;
          questionList.push(question);
        });
        this.questionLists[group.$key] = _.sortBy(questionList, 'order');
        for (const question of this.questionLists[group.$key]) {
          this.answers.pointsPossible += 5;
          answerGroup.pointsPossible += 5;
          if (existing && existing.groups && existing.groups[group.$key] && existing.groups[group.$key].questions &&
              existing.groups[group.$key].questions[question.$key]) {
            const points = existing.groups[group.$key].questions[question.$key];
            this.answers.points += points;
            answerGroup.points += points;
            answerGroup.questions[question.$key] = points;
          }
        }
      });
    });
  }

  public entryKey(entry) {
    if (!entry) {
      return '';
    }
    return entry.$key;
  }

  updatePoints() {
    let total = 0;
    Object.keys(this.answers.groups).forEach((group) => {
      let groupTotal = 0;
      Object.keys(this.answers.groups[group].questions).forEach((question) => {
        this.answers.groups[group].questions[question] = +this.answers.groups[group].questions[question];
        const val = this.answers.groups[group].questions[question];
        total += val;
        groupTotal += val;
      });
      this.answers.groups[group].points = groupTotal;
    });
    this.answers.points = total;
  }

  submit() {
    this.updatePoints();
    this.entry.set(this.answers).then(() => {
      this.router.navigate(['/track', this.scheduleId, this.date]);
    });
  }

}
