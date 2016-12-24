/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '@angular/material';
import { AngularFire } from 'angularfire2';
import { Observable } from 'rxjs';
import { HomeComponent } from './home.component';
import { AuthService } from '../auth.service';

describe('Component: Home', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

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
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AngularFire, useValue: mockAngularFire }
      ],
      declarations: [ HomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
