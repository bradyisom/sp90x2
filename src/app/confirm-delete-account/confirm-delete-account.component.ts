import { Component, OnInit } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirm-delete-account',
  templateUrl: './confirm-delete-account.component.html',
  styleUrls: ['./confirm-delete-account.component.scss']
})
export class ConfirmDeleteAccountComponent implements OnInit {

  constructor(public dialogRef: MdDialogRef<ConfirmDeleteAccountComponent>) { }

  ngOnInit() {
  }

}
