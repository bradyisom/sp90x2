/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MaterialModule, MdDialogRef } from '@angular/material';

import { ConfirmDeleteAccountComponent } from './confirm-delete-account.component';

describe('ConfirmDeleteAccountComponent', () => {
  let component: ConfirmDeleteAccountComponent;
  let fixture: ComponentFixture<ConfirmDeleteAccountComponent>;

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
      declarations: [ ConfirmDeleteAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDeleteAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
