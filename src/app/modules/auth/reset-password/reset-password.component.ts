import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FormValidators } from 'src/app/core/form-validators';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {

    emailFormControl: FormControl;
    failedResetPassword: boolean;
    failedResetPasswordMessage: string;
    passwordResetEmailSended: boolean;
    disableSendButton: boolean;
    @ViewChild('emailInput') emailInput?: ElementRef;

    constructor(private authService: AuthService) {
        this.emailFormControl = new FormControl('', [
            Validators.required,
            FormValidators.noEmpty,
            Validators.pattern(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)
        ]);
        this.failedResetPassword = false;
        this.failedResetPasswordMessage = '';
        this.disableSendButton = false;
        this.passwordResetEmailSended = false;
    }

    async sendResetPasswordEmail() {
        if (this.emailFormControl.invalid) {
            this.emailFormControl.markAsDirty();
            this.emailInput?.nativeElement.focus();
            return;
        }
        this.passwordResetEmailSended = false;
        this.failedResetPassword = false;
        this.emailFormControl.disable();
        this.disableSendButton = true;

        try {
            await this.authService.sendResetPasswordEmail(this.emailFormControl.value);
            this.passwordResetEmailSended = true;
            this.emailFormControl.enable();
            this.disableSendButton = false;
        } catch (error: any) {
            this.emailFormControl.enable();
            this.disableSendButton = false;
            this.failedResetPassword = true;

            this.failedResetPasswordMessage = 'Ocurrio un problema al enviar el correo. Intenta nuevamente';
            this.passwordResetEmailSended = false;
            if (error?.code === 'auth/user-not-found') {
                this.failedResetPasswordMessage = 'No hay ninguna cuenta asociada a ese correo. Verifica el correo e intenta nuevamente';
            }

        }

    }

}
