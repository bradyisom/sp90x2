import { Component, OnInit } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirm-delete-schedule',
  templateUrl: './confirm-delete-schedule.component.html',
  styleUrls: ['./confirm-delete-schedule.component.scss']
})
export class ConfirmDeleteScheduleComponent implements OnInit {

  constructor(public dialogRef: MdDialogRef<ConfirmDeleteScheduleComponent>) { }

  ngOnInit() {
  }

}
