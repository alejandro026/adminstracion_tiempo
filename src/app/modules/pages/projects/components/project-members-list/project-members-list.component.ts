import { Component, HostBinding, Input, ViewContainerRef } from '@angular/core';
import { ModalCloseValue } from 'src/app/core/interfaces/modal-close-value.interface';
import { ProjectTask } from 'src/app/core/interfaces/project-task.interface';
import { Project } from 'src/app/core/interfaces/project.interface';
import { AlertControllerService } from 'src/app/core/services/alert-controller.service';
import { ProjectMembersService } from 'src/app/core/services/project-members.service';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
    selector: 'app-project-members-list',
    templateUrl: './project-members-list.component.html',
    styleUrls: ['./project-members-list.component.scss']
})
export class ProjectMembersListComponent {

    @HostBinding('class') componentClass = 'flex flex-col gap-2 w-full md:max-w-sm';
    @Input() membersList: { member: string, selected: boolean }[] = [];
    @Input() project?: Project;
    @Input() projectTasksList: { task: ProjectTask, selected: boolean }[] = [];

    memberActionButtonsState = {
        disabledEdit: true,
        disabledDelete: true,
        disabledNew: false
    };

    showConfirmModalDeleteMembers: boolean;
    confirmModalMessage: string;
    showEditMemberModal: boolean;
    editMemberSelected?: string;
    showNewMemberModal: boolean;

    generalMembersCheckValue: boolean;

    constructor(
        private projectMembersService: ProjectMembersService,
        private alertController: AlertControllerService,
        private projectService: ProjectsService,
        private containerRef: ViewContainerRef
    ) {
        this.showConfirmModalDeleteMembers = false;
        this.confirmModalMessage = '';
        this.showEditMemberModal = false;
        this.showNewMemberModal = false;

        this.generalMembersCheckValue = false;
    }

    onGeneralMembersCheckChange(enabled: boolean) {
        this.memberActionButtonsState = {
            disabledEdit: !enabled || (enabled && this.membersList.length > 1) || (enabled && this.membersList.length === 0),
            disabledDelete: !enabled || (enabled && this.membersList.length === 0),
            disabledNew: false
        };

        this.membersList.forEach(item => {
            item.selected = enabled;
        });
    }

    onMemberCheckChange() {
        const selectedMembers = this.membersList.filter(m => m.selected).length;
        this.memberActionButtonsState = {
            disabledEdit: selectedMembers > 1 || selectedMembers === 0,
            disabledDelete: selectedMembers === 0,
            disabledNew: false
        };
        this.generalMembersCheckValue = selectedMembers === this.membersList.length;
    }

    openNewMemberModal() {
        this.showNewMemberModal = true;
    }

    async onCloseNewMemberModal(modalValue: ModalCloseValue<string>) {
        this.showNewMemberModal = false;
        if (modalValue.action === 'ok' && modalValue.value && this.project && this.project.id) {
            const newMembers = this.membersList.map(item => item.member).concat([modalValue.value]);
            const result = await this.projectService.updateProject({ members: newMembers }, this.project.id);

            if (result instanceof Error) {
                this.alertController.showAlert(this.containerRef, result.message, 'error', 3000);
            } else {
                this.alertController.showAlert(this.containerRef, 'Miembro agregado con exito', 'success', 2000);
                this.membersList.push({ selected: false, member: modalValue.value });
                this.project.members.push(modalValue.value);
            }
        }
    }

    openEditMemberModal() {
        this.showEditMemberModal = true;
        const membersSelected = this.membersList.reduce((acc, item) => item.selected ? acc + 1 : acc, 0);
        if (membersSelected !== 1) return;
        this.editMemberSelected = this.membersList.find(item => item.selected)?.member;
    }

    async onCloseEditMemberModal(modalValue: ModalCloseValue<string>) {
        this.showEditMemberModal = false;
        const membersSelectedCount = this.membersList.filter(item => item.selected).length;
        if (modalValue.action !== 'ok' || !modalValue.value || membersSelectedCount !== 1 || !this.project || !this.project.id) return;

        const memberSelected = this.membersList.find(item => item.selected);
        if (!memberSelected || memberSelected.member === modalValue.value) return;

        const oldMemberValue = memberSelected.member;
        const newMembers = this.membersList.map(item => {
            if (item.selected && modalValue.value) {
                return modalValue.value;
            }
            return item.member;
        });

        const result = await this.projectMembersService.editMember(newMembers, modalValue.value, oldMemberValue, this.project.id);
        if (result instanceof Error) {
            this.alertController.showAlert(this.containerRef, result.message, 'error', 3000);
            return;
        }

        this.alertController.showAlert(this.containerRef, 'Cambios guardados con exito', 'success', 2000);
        this.memberActionButtonsState = {
            disabledEdit: false,
            disabledDelete: true,
            disabledNew: false
        };
        for (let i = 0; i < this.project.members.length; i++) {
            if (this.project.members[i] === memberSelected.member) {
                this.project.members[i] = modalValue.value;
                break;
            }
        }
        for (const item of this.projectTasksList) {
            if (item.task.owner === memberSelected.member) {
                item.task.owner = modalValue.value;
            }
        }
        memberSelected.member = modalValue.value;
    }

    deleteMembers() {
        this.showConfirmModalDeleteMembers = true;
        this.confirmModalMessage = 'Se eliminaran los miembros seleccionados, desea continuar?';
    }

    async onCloseDeleteMembersConfirmModal(modalValue: ModalCloseValue<any>) {
        this.showConfirmModalDeleteMembers = false;
        const membersSelected = this.membersList.filter(item => item.selected);
        if (modalValue.action !== 'ok' || membersSelected.length === 0 || !this.project || !this.project.id) return;

        const newMembers = this.membersList.filter(item => !item.selected);
        const deletedMembers = this.membersList.filter(item => item.selected);
        const result = await this.projectMembersService.deleteMembers(newMembers.map(item => item.member), deletedMembers.map(item => item.member), this.project.id);
        if (result instanceof Error) {
            this.alertController.showAlert(this.containerRef, result.message, 'error', 3000);
            return;
        }

        this.alertController.showAlert(this.containerRef, 'Miembro(s) eliminado(s) con exito', 'success', 2000);
        this.memberActionButtonsState = {
            disabledEdit: true,
            disabledDelete: true,
            disabledNew: false
        };
        for (const item of this.projectTasksList) {
            if (item.task.owner && deletedMembers.map(item => item.member).includes(item.task.owner)) {
                item.task.owner = null;
            }
        }
        this.generalMembersCheckValue = false;
        this.membersList.length = 0;
        this.membersList = newMembers;
        this.project.members.length = 0;
        this.project.members = newMembers.map(item => item.member);
    }

}
