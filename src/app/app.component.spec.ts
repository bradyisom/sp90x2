/* tslint:disable:no-unused-variable */

import { Component } from '@angular/core';
import { TestBed, async, fakeAsync, tick, ComponentFixture } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MdDialog } from '@angular/material';
import { AppMaterialModule } from './app.module';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { ConfirmService } from './confirm.service';

import { AppComponent } from './app.component';

@Component({
  template: `
    <router-outlet></router-outlet>
    <router-outlet name="other"></router-outlet>
  `
})
class ParentComponent {
}

@Component({
  template: ''
})
class DummyComponent {
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  const mockAuthService = {
    user: Observable.of({
      uid: 'U1'
    }),
    delete: jasmine.createSpy('delete account', () => {}).and.callThrough()
  };

  let dialogResult = 'confirm';
  const mockConfirm = {
    show: jasmine.createSpy('show', () => {
      return { afterClosed: () => Observable.of(dialogResult) };
    }).and.callThrough()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AppMaterialModule,
        RouterTestingModule.withRoutes([{
          path: '',
          component: ParentComponent,
          children: [{
            path: '',
            component: DummyComponent
          }, {
            path: 'title',
            children: [{
              path: '',
              outlet: 'other',
              component: DummyComponent,
              data: {
                title: 'Hidden Title'
              }
            }, {
              path: '',
              component: DummyComponent,
              data: {
                title: 'Test Title'
              }
            }]
          }, {
            path: 'back',
            children: [{
              path: '',
              outlet: 'other',
              component: DummyComponent,
              data: {
                back: {
                  title: 'Other',
                  route: '/other'
                }
              }
            }, {
              path: '',
              component: DummyComponent,
              data: {
                back: {
                  title: 'Home',
                  route: '/home'
                }
              }
            }]
          }, {
            path: 'home',
            component: DummyComponent,
            data: {
              title: 'Home'
            }
          }, {
            path: 'about',
            component: DummyComponent,
            data: {
              title: 'About'
            }
          }]
        }])
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfirmService, useValue: mockConfirm },
      ],
      declarations: [
        AppComponent,
        DummyComponent,
        ParentComponent,
      ],
    });
    TestBed.compileComponents();
  });

  beforeEach(() => {
    mockAuthService.delete.calls.reset();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should set the auth property', () => {
    component.auth.user.subscribe((user) => {
      expect(user.uid).toBe('U1');
    });
  });

  it(`should have an app title`, () => {
    expect(component.appName).toEqual('SP90X');
  });

  it(`should initialize showTitle to false`, () => {
    expect(component.showTitle).toBe(false);
  });


  describe('route changes', () => {
    let router: Router;

    beforeEach(() => {
      router = TestBed.get(Router);
    });

    it('should handle no title', fakeAsync(() => {
      router.navigate(['/']);
      tick();
      expect(component.showTitle).toBe(true);
      expect(component.title).toBe('');
    }));

    it('should handle a title', fakeAsync(() => {
      router.navigate(['/title']);
      tick();
      expect(component.showTitle).toBe(true);
      expect(component.title).toBe('Test Title');
    }));

    it('should handle no back info', fakeAsync(() => {
      router.navigate(['/']);
      tick();
      expect(component.back).toEqual({});
    }));

    it('should handle back info', fakeAsync(() => {
      router.navigate(['/back']);
      tick();
      expect(component.back).toEqual({
        title: 'Home',
        route: '/home'
      });
    }));

    it('should hide home title', fakeAsync(() => {
      router.navigate(['/home']);
      tick();
      expect(component.showTitle).toBe(false);
      expect(component.title).toBe('Home');
    }));

    it('should hide about title', fakeAsync(() => {
      router.navigate(['/about']);
      tick();
      expect(component.showTitle).toBe(false);
      expect(component.title).toBe('About');
    }));

  });


  // it('should render title in a h1 tag', async(() => {
  //   let fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   let compiled = fixture.debugElement.nativeElement;
  //   expect(compiled.querySelector('h1').textContent).toContain('app works!');
  // }));


  describe('deleteAccount', () => {

    it('should confirm', () => {
      component.deleteAccount();
      expect(mockConfirm.show).toHaveBeenCalledWith(
        `Are you sure you want to permanently delete your account and all of your data?`,
        'Delete My Account',
        'warn'
      );
    });

    it('should remove the account', () => {
      component.deleteAccount();
      expect(mockAuthService.delete).toHaveBeenCalled();
    });

    it('should not remove the account', () => {
      dialogResult = 'cancel';
      component.deleteAccount();
      expect(mockAuthService.delete).not.toHaveBeenCalled();
    });

  });

});
