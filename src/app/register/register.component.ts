import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ErrorService } from '../error.service';

const md5 = require('md5');

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public editForm: FormGroup;

  constructor(
    private auth: AuthService,
    private router: Router,
    private errorService: ErrorService,
  ) { }

  ngOnInit() {
    this.editForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      passwordConfirm: new FormControl('', Validators.required),
    }, (g: FormGroup) => {
      return g.get('password').value === g.get('passwordConfirm').value
        ? null : {'mismatch': true};
    });
  }

  public getGravatarUrl() {
    const email = this.editForm.get('email').value || '';
    return `https://www.gravatar.com/avatar/${md5(email)}?s=80&d=retro`;
  }

  public create() {
    const displayName = `${this.editForm.get('firstName').value} ${this.editForm.get('lastName').value}`;
    const email = this.editForm.get('email').value;
    const password = this.editForm.get('password').value;
    this.auth.create(displayName, email, password, this.getGravatarUrl()).then(() => {
      return this.auth.login(email, password);
    }).then(() => {
      this.router.navigate(['/home']);
    }).catch((e: Error) => {
      this.errorService.show(e);
    });
  }

  public cancel() {
    this.router.navigate(['/login']);
  }

}
