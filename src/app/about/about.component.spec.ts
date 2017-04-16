/* tslint:disable:no-unused-variable*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AppMaterialModule } from '../app.module';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from '../auth.service';

import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  const mockAuthService: any = {
    user: Observable.of({
      uid: 'U1',
      displayName: 'Brady Isom'
    })
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AppMaterialModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [{
        provide: AuthService, useValue: mockAuthService
      }],
      declarations: [ AboutComponent ]
    });

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
