/* tslint:disable:no-unused-variable */

import { TestBed, async, inject, ComponentFixture } from '@angular/core/testing';
import { MaterialModule, MdDialog, MdDialogRef } from '@angular/material';
import { ConfirmService, ConfirmComponent } from './confirm.service';

describe('ConfirmService', () => {
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
        ConfirmService,
        { provide: MdDialog, useValue: mockDialog },
      ]
    });

    cmp = {
      message: undefined,
      title: undefined
    };
  });

  it('should create', inject([ConfirmService], (service: ConfirmService) => {
    expect(service).toBeTruthy();
  }));

  describe('show', () => {
    it('should show a simple dialog', inject([ConfirmService, MdDialog], (service: ConfirmService, dialog: MdDialog) => {
      service.show('Test message');
      expect(dialog.open).toHaveBeenCalled();
      expect(cmp.message).toBe('Test message');
      expect(cmp.confirmLabel).toBeFalsy();
      expect(cmp.confirmColor).toBeFalsy();
      expect(cmp.title).toBeFalsy();
    }));

    it('should confirm with a button label and color', inject([ConfirmService, MdDialog], (service: ConfirmService, dialog: MdDialog) => {
      service.show('Test message', 'Delete', 'warn');
      expect(dialog.open).toHaveBeenCalled();
      expect(cmp.message).toBe('Test message');
      expect(cmp.confirmLabel).toBe('Delete');
      expect(cmp.confirmColor).toBe('warn');
      expect(cmp.title).toBeFalsy();
    }));

    it('should confirm with a title', inject([ConfirmService, MdDialog], (service: ConfirmService, dialog: MdDialog) => {
      service.show('Test message', 'Delete', 'warn', 'Title');
      expect(dialog.open).toHaveBeenCalled();
      expect(cmp.message).toBe('Test message');
      expect(cmp.confirmLabel).toBe('Delete');
      expect(cmp.confirmColor).toBe('warn');
      expect(cmp.title).toBe('Title');
    }));
  });
});

describe('ConfirmComponent', () => {
  let component: ConfirmComponent;
  let fixture: ComponentFixture<ConfirmComponent>;

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
      declarations: [ ConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmComponent);
    component = fixture.componentInstance;
  });

  it('should create a basic dialog', () => {
    component.message = 'Test message';
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[md-dialog-title]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[md-dialog-content]').innerHTML).toContain('Test message');
    expect(fixture.nativeElement.querySelector('.confirm-btn').innerHTML).toContain('OK');
    expect(fixture.nativeElement.querySelector('.confirm-btn').getAttribute('ng-reflect-color')).toBe('accent');
  });

  it('should create a full dialog with a title', () => {
    component.title = 'My title';
    component.confirmLabel = 'Delete me';
    component.confirmColor = 'warn';
    component.message = 'Test message';
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[md-dialog-title]').innerHTML).toContain('My title');
    expect(fixture.nativeElement.querySelector('[md-dialog-content]').innerHTML).toContain('Test message');
    expect(fixture.nativeElement.querySelector('.confirm-btn').innerHTML).toContain('Delete me');
    expect(fixture.nativeElement.querySelector('.confirm-btn').getAttribute('ng-reflect-color')).toBe('warn');
  });
});

