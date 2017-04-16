/* tslint:disable:no-unused-variable */

import { TestBed, async, fakeAsync, tick, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '../app.module';
import { AngularFire } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { FitTestComponent } from './fit-test.component';

describe('Component: FitTest', () => {

  let component: FitTestComponent;
  let fixture: ComponentFixture<FitTestComponent>;

  let fitTest: any[];
  let entries: any;

  let router: Router;

  const setSpy = jasmine.createSpy('set', () => {
    return Promise.resolve({});
  }).and.callThrough();

  const mockAngularFire = {
    database: {
      list: jasmine.createSpy('list', () => {
        return Observable.of(fitTest);
      }).and.callThrough(),
      object: jasmine.createSpy('object', () => {
        const result = Observable.of(entries);
        (<any>result).set = setSpy;
        return result;
      }).and.callThrough()
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AppMaterialModule,
        RouterTestingModule.withRoutes([]),
        FormsModule
      ],
      providers: [
        { provide: AngularFire, useValue: mockAngularFire }
      ],
      declarations: [ FitTestComponent ]
    });

    fitTest = [{
      $key: 'FAITH',
      order: 1,
      title: 'Faith',
      questions: {
        Q2: {
          order: 2,
          title: 'I feel confident that God loves me.'
        },
        Q1: {
          order: 1,
          title: 'I believe in Christ and accept Him as my Savior.'
        }
      }
    }, {
      $key: 'HOPE',
      order: 2,
      title: 'Hope',
      questions: {
        Q1: {
          order: 1,
          title: 'One of my greatest desires is to inherit eternal life in the celestial kingdom of God.'
        }
      }
    }];
    entries = {};

    router = TestBed.get(Router);
    const route = TestBed.get(ActivatedRoute);
    route.snapshot.data = {
      user: {
        uid: 'U1'
      }
    };
    route.params = Observable.of({
      scheduleId: 'SCHED1',
      date: '2016-12-27'
    });
  });

  it('should create', () => {
    fixture = TestBed.createComponent(FitTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });


  describe('new test', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(FitTestComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should load the fit test', () => {
      expect(mockAngularFire.database.list).toHaveBeenCalledWith('fitTest', {
        query: {
          orderByChild: 'order'
        }
      });
      component.fitTest.subscribe((test) => {
        expect(test).toEqual(fitTest);
      });
    });

    it('should load the question lists', () => {
      expect(component.questionLists).toEqual({
        FAITH: [{
          $key: 'Q1',
          order: 1,
          title: 'I believe in Christ and accept Him as my Savior.'
        }, {
          $key: 'Q2',
          order: 2,
          title: 'I feel confident that God loves me.'
        }],
        HOPE: [{
          $key: 'Q1',
          order: 1,
          title: 'One of my greatest desires is to inherit eternal life in the celestial kingdom of God.'
        }]
      });
    });

    it('should load empty answers', () => {
      expect(component.answers).toEqual({
        points: 0,
        pointsPossible: 15,
        groups: {
          FAITH: {
            points: 0,
            pointsPossible: 10,
            questions: {}
          },
          HOPE: {
            points: 0,
            pointsPossible: 5,
            questions: {}
          }
        }
      });
    });

  });

  describe('existing test', () => {
    beforeEach(() => {
      entries = {
        points: 3,
        pointsPossible: 15,
        groups: {
          FAITH: {
            points: 3,
            pointsPossible: 10,
            questions: {
              Q1: 2,
              Q2: 1
            }
          },
          HOPE: {
            points: 0,
            pointsPossible: 5
          }
        }
      };

      fixture = TestBed.createComponent(FitTestComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should load existing answers', () => {
      expect(component.answers).toEqual({
        points: 3,
        pointsPossible: 15,
        groups: {
          FAITH: {
            points: 3,
            pointsPossible: 10,
            questions: {
              Q1: 2,
              Q2: 1
            }
          },
          HOPE: {
            points: 0,
            pointsPossible: 5,
            questions: {}
          }
        }
      });
    });

  });

  describe('method', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(FitTestComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    describe('entryKey', () => {
      it('should return empty for no entry', () => {
        expect(component.entryKey(null)).toBe('');
      });

      it('should return the entry key', () => {
        expect(component.entryKey({
          $key: 'ENTRY1'
        })).toBe('ENTRY1');
      });
    });

    describe('updatePoints', () => {

      it('should update totals', () => {
        component.answers.groups['HOPE'].questions['Q1'] = 3;
        component.updatePoints();
        expect(component.answers).toEqual({
          points: 3,
          pointsPossible: 15,
          groups: {
            FAITH: {
              points: 0,
              pointsPossible: 10,
              questions: {}
            },
            HOPE: {
              points: 3,
              pointsPossible: 5,
              questions: {
                Q1: 3
              }
            }
          }
        });
      });

    });

    describe('submit', () => {
      beforeEach(() => {
        spyOn(router, 'navigate').and.callFake(() => {});
      });

      it('should save answers', () => {
        component.submit();
        expect(setSpy).toHaveBeenCalledWith(component.answers);
      });

      it('should navigate to tracking', fakeAsync(() => {
        component.submit();
        tick();
        expect(router.navigate).toHaveBeenCalledWith(['/track', 'SCHED1', '2016-12-27']);
      }));
    });

  });

});
