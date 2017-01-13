/* tslint:disable:no-unused-variable */

import { TestBed, async, inject, ComponentFixture } from '@angular/core/testing';
import { MaterialModule, MdDialog, MdDialogRef } from '@angular/material';
import { ErrorService, ErrorComponent } from './error.service';

describe('ErrorService', () => {

  let cmp: any;

  const mockDialog = {
    open: jasmine.createSpy('open', () => {
      return {
        componentInstance: cmp
      };
    }).and.callThrough()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule.forRoot()
      ],
      providers: [
        ErrorService,
        { provide: MdDialog, useValue: mockDialog },
      ]
    });

    cmp = {
      error: undefined,
      title: undefined
    };
  });

  it('should create', inject([ErrorService], (service: ErrorService) => {
    expect(service).toBeTruthy();
  }));

  describe('show', () => {
    it('should show an error dialog', inject([ErrorService, MdDialog], (service: ErrorService, dialog: MdDialog) => {
      service.show(new Error('Test message'));
      expect(dialog.open).toHaveBeenCalled();
      expect(cmp.error.message).toBe('Test message');
      expect(cmp.title).toBeFalsy();
    }));

    it('should show an error dialog with a title', inject([ErrorService, MdDialog], (service: ErrorService, dialog: MdDialog) => {
      service.show(new Error('Test message'), 'My title');
      expect(dialog.open).toHaveBeenCalled();
      expect(cmp.error.message).toBe('Test message');
      expect(cmp.title).toBe('My title');
    }));
  });
});

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  const mockMdDialogRef = {
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule.forRoot()
      ],
      providers: [
        { provide: MdDialogRef, useValue: mockMdDialogRef }
      ],
      declarations: [ ErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
  });

  it('should create with error', () => {
    component.error = new Error('Test error');
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[md-dialog-title]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[md-dialog-content]').innerHTML).toContain('Test error');
  });

  it('should create with error and title', () => {
    component.error = new Error('Test error');
    component.title = 'My title';
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[md-dialog-title]').innerHTML).toContain('My title');
    expect(fixture.nativeElement.querySelector('[md-dialog-content]').innerHTML).toContain('Test error');
  });
});

