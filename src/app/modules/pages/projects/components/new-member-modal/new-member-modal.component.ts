import { Component, HostBinding, OnInit, Output, EventEmitter, HostListener, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserInfo } from 'firebase/auth';
import { take } from 'rxjs/operators';
import { hiddeModalAnimation } from 'src/app/core/animations/hidde-modal.animation';
import { FormValidators } from 'src/app/core/form-validators';
import { ModalCloseValue } from 'src/app/core/interfaces/modal-close-value.interface';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
    selector: 'app-new-member-modal',
    templateUrl: './new-member-modal.component.html',
    styleUrls: ['./new-member-modal.component.scss'],
    animations: [
        hiddeModalAnimation
    ]
})
export class NewMemberModalComponent implements OnInit {

    @HostBinding('class') modalClass = 'modal modal-bottom sm:modal-middle';
    @HostBinding('id') componentId = 'new-member-modal';
    @HostBinding('@hiddeModal') hiddeAnimationModal = '';
    @Input() members: string[] = [];
    @Output() closeModal = new EventEmitter<ModalCloseValue<string>>();

    formNewMember: FormGroup;
    formMemberControl: FormControl;
    currentUser?: UserInfo;

    constructor(private authService: AuthService) {
        this.formMemberControl = new FormControl('', [
            Validators.required,
            FormValidators.noEmpty,
            Validators.pattern(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)
        ]);

        this.formNewMember = new FormGroup({
            member: this.formMemberControl
        });

        this.authService.currentUser.pipe(take(1)).subscribe({
            next: user => {
                if (user) this.currentUser = user;
            }
        });
    }

    ngOnInit() {
        setTimeout(() => {
            this.modalClass += ' modal-open';
        }, 50);
        this.formMemberControl.addValidators(FormValidators.noRepeatMember(this.members));
    }

    close() {
        this.closeModal.emit({ action: 'cancel' });
    }

    @HostListener('click', ['$event'])
    onClickComponent(event: any) {
        if (event.target.classList.contains('modal')) {
            this.closeModal.emit({ action: 'cancel' });
        }
    }

    saveMember() {
        if (this.formNewMember.invalid || !this.currentUser) return;

        const memberValue = this.formMemberControl.value;
        this.closeModal.emit({ action: 'ok', value: memberValue });
    }

}
