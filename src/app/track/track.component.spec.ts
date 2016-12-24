/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '@angular/material';
import { AngularFire } from 'angularfire2';
import { Observable } from 'rxjs';
import { TrackComponent } from './track.component';

describe('Component: TrackComponent', () => {

  let component: TrackComponent;
  let fixture: ComponentFixture<TrackComponent>;

  const mockAngularFire = {
    database: {
      list: () => Observable.of([]),
      object: () => Observable.of({})
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule.forRoot(),
        RouterTestingModule.withRoutes([{
          path: 'track/:scheduleId/:date',
          component: TrackComponent
        }]),
      ],
      providers: [
        { provide: AngularFire, useValue: mockAngularFire },
      ],
      declarations: [ TrackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    let router = TestBed.get(Router);
    spyOn(router, 'navigate').and.callFake(() => {});
    let route = TestBed.get(ActivatedRoute);
    route.snapshot.data = {
      user: {
        uid: 'U1'
      }
    };
    fixture = TestBed.createComponent(TrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
