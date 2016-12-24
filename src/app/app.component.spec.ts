/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '@angular/material';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

import { AppComponent } from './app.component';

describe('AppComponent', () => {

  const mockAuthService = {
    user: Observable.of({
      uid: 'U1'
    })
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule.forRoot(),
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ],
      declarations: [
        AppComponent
      ],
    });
    TestBed.compileComponents();
  });

  it('should create the app', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    expect(app).toBeTruthy();
  }));

  // it(`should have as title 'app works!'`, async(() => {
  //   let fixture = TestBed.createComponent(AppComponent);
  //   let app = fixture.debugElement.componentInstance;
  //   expect(app.title).toEqual('app works!');
  // }));

  // it('should render title in a h1 tag', async(() => {
  //   let fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   let compiled = fixture.debugElement.nativeElement;
  //   expect(compiled.querySelector('h1').textContent).toContain('app works!');
  // }));
});
