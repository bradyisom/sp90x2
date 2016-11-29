import { Component, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Component({
  selector: 'app-fit-test',
  templateUrl: './fit-test.component.html',
  styleUrls: ['./fit-test.component.scss']
})
export class FitTestComponent implements OnInit {
  private fitTest: FirebaseListObservable<any>;
  private questionLists: any;

  public answers: any;

  constructor(private af: AngularFire) { }

  ngOnInit() {
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
        pointsPossible: 0
      };
      groups.forEach((group)=> {
        this.answers[group.$key] = {
          points: 0,
          pointsPossible: 0
        };
        this.questionLists[group.$key] = this.af.database.list(`fitTest/${group.$key}/questions`, {
          query: { orderByChild: 'order' }
        })
        this.questionLists[group.$key].subscribe((questions: any[]) => {
          questions.forEach((question)=> {
            this.answers.pointsPossible += 5;
            this.answers[group.$key].pointsPossible += 5;
          });
        })
      });
    });
  }

  updatePoints() {
    let total = 0;
    Object.keys(this.answers).forEach((group) => {
      if (group == 'points' || group == 'pointsPossible') {
        return;
      }
      let groupTotal = 0;
      Object.keys(this.answers[group]).forEach((question)=> {
        if (question == 'points' || question == 'pointsPossible') {
          return;
        }
        let val = +this.answers[group][question] || 0;
        total += val;
        groupTotal += val;
      });
      this.answers[group].points = groupTotal;
    });
    this.answers.points = total;
  }

}
