import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { AuthService } from '../auth.service';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/observable/merge';

const chartJs = require('chart.js');

import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit, OnDestroy {
  private userId: string;
  private dataSubscription: Subscription;
  private fitTestEntries: any = {};
  private fitTestGroups: any[];

  public loaded = false;
  public fitTestCharts: any[];

  constructor(
    private af: AngularFire,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.user.first().subscribe(user => {
      this.userId = user.uid;
    });

    this.af.database.list('/fitTest').first().subscribe((test) => {
      this.fitTestGroups = _.sortBy(_.values(test), 'order');
      this.fitTestGroups.unshift({
        title: 'Overall',
        pointsPossible: _.sum(_.map(test, 'pointsPossible'))
      });

      this.af.database.list(`/schedules/${this.userId}`, {
        query: {
          orderBy: 'startDate'
        }
      }).first().subscribe((schedules) => {
        const fitTests = [];
        if (schedules.length) {
          for (const schedule of schedules) {
            fitTests.push(this.af.database.list(`/entries/${schedule.$key}/fitTest`));
          }
          this.dataSubscription = Observable.merge.apply(Observable, fitTests)
            .concatMap(entry => {
              if (!entry.length) {
                this.loaded = true;
              }
              return entry;
            })
            .subscribe((entry) => {
              this.fitTestEntries[entry.$key] = entry;
              this.loadEntries();
            });
        } else {
          this.loaded = true;
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  private loadEntries() {
    const entries: any[] = _.sortBy(_.values(this.fitTestEntries), '$key');
    const labels = _.map(entries, (entry: any) => {
      return moment(entry.$key, 'YYYY-MM-DD').format('ll');
    });

    this.fitTestCharts = [];
    this.fitTestGroups.forEach((group) => {
      const data: number[] = _.map(entries, (entry: any) => {
        if (group.title === 'Overall') {
          return entry.points;
        }
        return entry.groups[group.$key].points;
      });

      const chart: any = {
        title: group.title,
        labels: labels,
        options: {
          animation: false,
          responsive: true,
          defaultFontFamily: 'Roboto, \'Helvetica Neue\', sans-serif',
          tooltips: {
            callbacks: {
              label: (item, itemData) => {
                const val = itemData.datasets[0].data[item.index];
                return `${group.title} - ${val} / ${group.pointsPossible}`;
              }
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                fontColor: '#fff',
                min: 0,
                max: group.pointsPossible,
                stepSize: 5
              },
              gridLines: {
                drawBorder: false,
                zeroLineColor: 'rgba(148,159,177,0.2)',
                color: 'rgba(148,159,177,0.2)'
              },
              scaleLabel: {
                fontColor: '#fff'
              }
            }],
            xAxes: [{
              ticks: {
                fontColor: '#fff'
              },
              gridLines: {
                drawBorder: false,
                zeroLineColor: 'rgba(148,159,177,0.2)',
                color: 'rgba(148,159,177,0.2)'
              },
            }]
          }
        },
        colors: [{ // Grey
          backgroundColor: 'rgba(148,159,177,0.2)',
          borderColor: 'rgba(148,159,177,1)',
          pointBackgroundColor: 'rgba(148,159,177,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }],
        data: [{
          data: data,
          label: group.title
        }]
      };
      // Overall overrides
      if (group.title === 'Overall') {
        chart.options.scales.yAxes[0].ticks.max = 300;
        chart.options.scales.yAxes[0].ticks.stepSize = 60;
        chart.colors = [{ // Deep Orange
          backgroundColor: 'rgba(255,87,34,0.2)',
          borderColor: 'rgba(255,87,34,1)',
          pointBackgroundColor: 'rgba(255,87,34,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255,87,34,0.8)'
        }];
      }

      this.fitTestCharts.push(chart);
    });

    this.loaded = true;
  }

  public chartTitle(chart: any) {
    return chart.title;
  }
}
