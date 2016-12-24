/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MaterialModule, MdDialogRef } from '@angular/material';

import { ConfirmDeleteScheduleComponent } from './confirm-delete-schedule.component';

describe('ConfirmDeleteScheduleComponent', () => {
  let component: ConfirmDeleteScheduleComponent;
  let fixture: ComponentFixture<ConfirmDeleteScheduleComponent>;

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
      declarations: [ ConfirmDeleteScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDeleteScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
