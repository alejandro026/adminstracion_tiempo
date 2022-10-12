import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormValidators } from 'src/app/core/form-validators';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

    emailControl: FormControl;
    passwordControl: FormControl;
    registerForm: FormGroup;
    disableRegisterButton: boolean;
    failedRegister: boolean;
    failedRegisterMessage: string;
    @ViewChild('emailInput') emailInput?: ElementRef;
    @ViewChild('passwordInput') passwordInput?: ElementRef;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        this.emailControl = new FormControl('', [Validators.required, FormValidators.noEmpty, Validators.pattern(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)]);
        this.passwordControl = new FormControl('', [Validators.required, Validators.minLength(6)]);
        this.registerForm = new FormGroup({
            email: this.emailControl,
            password: this.passwordControl
        });
        this.disableRegisterButton = false;
        this.failedRegister = false;
        this.failedRegisterMessage = 'Problema al registrar usuario';
    }

    async register() {
        if (this.registerForm.invalid) {
            this.emailControl.markAsDirty();
            this.passwordControl.markAsDirty();
            if (this.passwordControl.invalid) {
                this.passwordInput?.nativeElement.focus();
            }

            if (this.emailControl.invalid) {
                this.emailInput?.nativeElement.focus();
            }
            return;
        };

        try {
            this.failedRegister = false;
            this.emailControl.disable();
            this.passwordControl.disable();
            this.disableRegisterButton = true;

            await this.authService.createUser(this.emailControl.value, this.passwordControl.value);
            this.router.navigate(['app/tasks']);
        } catch (error: any) {
            this.failedRegister = true;
            this.failedRegisterMessage = 'Problema al registrar usuario';
            if (error?.code === 'auth/email-already-exists') {
                this.failedRegisterMessage = 'Ya existe una cuenta con el mismo correo';
            }
        }

    }

}
