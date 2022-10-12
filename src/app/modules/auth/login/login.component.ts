import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    loginForm: FormGroup;
    failedLogin: boolean;
    failedLoginMessage: string;
    disableLoginButton: boolean;
    @ViewChild('emailInput') emailInput?: ElementRef;
    @ViewChild('passwordInput') passwordInput?: ElementRef;

    constructor(private authService: AuthService, private router: Router) {
        this.loginForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)]),
            password: new FormControl('', [Validators.required])
        });
        this.failedLogin = false;
        this.failedLoginMessage = 'Ocurrio un problema, intenta nuevamente';
        this.disableLoginButton = false;
    }

    checkControlInvalid(controlName: string) {
        const control = this.loginForm.get(controlName);
        return control?.touched && control?.invalid;
    }

    get emailMessageError() {
        let message = 'El correo es requerido';
        const control = this.loginForm.get('email');
        if (this.checkControlInvalid('email') && control?.errors?.['pattern']) {
            message = 'Debes ingresar un correo valido';
        }

        return message;
    }

    get passwordMessageError() {
        const message = 'La contraseña es requerida';
        return message;
    }

    controlValidationClasses(constrolName: string) {
        return {
            invalid: this.checkControlInvalid(constrolName)
        };
    }

    async login() {
        if (this.loginForm.valid) {
            this.failedLogin = false;
            this.loginForm.controls['email'].disable();
            this.loginForm.controls['password'].disable();
            this.disableLoginButton = true;
            try {
                const email = this.loginForm.get('email')?.value;
                const password = this.loginForm.get('password')?.value;
                await this.authService.signIn(email, password);
                this.router.navigate(['app/tasks']);
            } catch (error: any) {
                this.failedLogin = true;
                this.failedLoginMessage = 'Ocurrio un problema, intenta nuevamente';
                if (error?.code === 'auth/wrong-password') {
                    this.failedLoginMessage = 'Contraseña incorrecta';
                }
            }
            this.loginForm.controls['email'].enable();
            this.loginForm.controls['password'].enable();
            this.disableLoginButton = false;
        }

        if (this.loginForm.invalid) {
            this.loginForm.get('email')?.markAsTouched();
            this.loginForm.get('password')?.markAsTouched();
            this.checkControlInvalid('email');
            this.checkControlInvalid('password');
            if (this.loginForm.get('password')?.invalid) {
                this.passwordInput?.nativeElement.focus();
            }

            if (this.loginForm.get('email')?.invalid) {
                this.emailInput?.nativeElement.focus();
            }
        }
    }
}
