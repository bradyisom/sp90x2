/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '@angular/material';
import { AngularFire } from 'angularfire2';
import { Observable } from 'rxjs';
import { FitTestComponent } from './fit-test.component';

describe('Component: FitTest', () => {

  let component: FitTestComponent;
  let fixture: ComponentFixture<FitTestComponent>;

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
        RouterTestingModule.withRoutes([]),
        FormsModule
      ],
      providers: [
        { provide: AngularFire, useValue: mockAngularFire }
      ],
      declarations: [ FitTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    let route = TestBed.get(ActivatedRoute);
    route.snapshot.data = {
      user: {
        uid: 'U1'
      }
    };
    fixture = TestBed.createComponent(FitTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
