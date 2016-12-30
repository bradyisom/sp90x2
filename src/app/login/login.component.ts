import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ErrorService } from '../error.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string;
  public password: string;

  constructor(private auth: AuthService, private errorService: ErrorService) {
  }

  ngOnInit() {
  }

  login () {
    this.auth.login(this.email, this.password).catch((error: Error) => {
      this.errorService.show(error);
    });
  }

  googleLogin () {
    this.auth.googleLogin().catch((error: Error) => {
      this.errorService.show(error);
    });
  }

  facebookLogin () {
    this.auth.facebookLogin().catch((error: Error) => {
      this.errorService.show(error);
    });
  }
}
