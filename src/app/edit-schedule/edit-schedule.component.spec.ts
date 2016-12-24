/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { AngularFire } from 'angularfire2';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { EditScheduleComponent } from './edit-schedule.component';

describe('Component: EditSchedule', () => {

  let component: EditScheduleComponent;
  let fixture: ComponentFixture<EditScheduleComponent>;

  const mockAuthService = {
    user: Observable.of({
      uid: 'U1'
    })
  };

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
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AngularFire, useValue: mockAngularFire }
      ],
      declarations: [ EditScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
