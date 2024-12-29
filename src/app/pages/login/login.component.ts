import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { LogUSerDTO } from '../../interfaces/log-user-dto';
import { TokenGetter } from '../../interfaces/serverDTOs/token-getter';
import { MessageModalComponent } from '../../components/message-modal/message-modal.component';
import { ModalMessageService } from '../../services/modal-message.service';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MessageModalComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {

  form: FormGroup;

  constructor(private router: Router,
              private fb: FormBuilder,
              private apiService: ApiService,
              private authService: AuthService,
              private messageModal:ModalMessageService
             )
  {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],

    })
  }

  login()
  {
    const account: LogUSerDTO =
    {
      email: this.form.value.email,
      password: this.form.value.password
    }

    this.apiService.logUser(account).subscribe(
      (response: TokenGetter)=>{
        this.authService.setToken(response.token);
        this.router.navigate(['/main'])
      },
      (error) => {
        if(error.status==401 || error.status==404)
          {
            this.messageModal.showMessage("Credenciales inválidas.", true);
          }
        console.log(error)
      }
    )

  }


}
