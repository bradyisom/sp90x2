import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public email: string;
  public password: string;

  constructor(private auth: AuthService) {
  }

  ngOnInit() {
  }

  login () {
    this.auth.login(this.email, this.password);
  }

  googleLogin () {
    this.auth.googleLogin();
  }

  facebookLogin () {
    this.auth.facebookLogin();
  }
}
