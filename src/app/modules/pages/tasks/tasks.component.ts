import { Component, HostBinding, OnInit, ViewContainerRef } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { take } from 'rxjs';
import { filterTasksOptions, filterTasksPriorityOptions } from 'src/app/core/constants';
import { TaskFilterOptionValues } from 'src/app/core/enums';
import { FilterOption } from 'src/app/core/interfaces/filter-option.interface';
import { ModalCloseValue } from 'src/app/core/interfaces/modal-close-value.interface';
import { SelectOption } from 'src/app/core/interfaces/select-option.interface';
import { Task } from 'src/app/core/interfaces/task.interface';
import { AlertControllerService } from 'src/app/core/services/alert-controller.service';
import { TasksService } from 'src/app/core/services/tasks.service';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {

    @HostBinding('id') tasksPageId = 'tasks-page-container';
    @HostBinding('class') tasksClass = ' overflow-y-scroll';

    tasksList: { loading: boolean, task: Task }[];
    filterOptions: FilterOption[];
    filterPriorityOptions: FilterOption[];

    filterOptionSelected: FilterOption;
    sortOptionSelected: SelectOption;

    searchedValue: string;

    limitTasks: number;

    loadingTasks: boolean;
    disableNextButton: boolean;
    disablePrevButton: boolean;

    lastFilterValue: number;
    lastSortValue: number;

    showNewTaskModal: boolean;
    showEditTaskModal: boolean;
    showConfirmDeleteTaskModal: boolean;
    showTaskDetailModal: boolean;

    taskSelectedToEdit?: Task;
    taskItemEdited?: { loading: boolean, task: Task };

    taskItemDelete?: { loading: boolean, task: Task };
    taskSelectedToDetail?: Task;

    constructor(private tasksService: TasksService, private alertControllerService: AlertControllerService, private containerRef: ViewContainerRef) {
        this.tasksList = [];

        this.filterOptions = filterTasksOptions;

        this.filterPriorityOptions = filterTasksPriorityOptions;

        this.filterOptionSelected = this.filterOptions[0];
        this.lastFilterValue = this.filterOptionSelected.value;
        this.sortOptionSelected = this.filterOptionSelected.sortOptions[0];
        this.lastSortValue = this.sortOptionSelected.value;

        this.searchedValue = '';

        this.limitTasks = 10;

        this.loadingTasks = false;
        this.disablePrevButton = true;
        this.disableNextButton = false;

        this.showNewTaskModal = false;
        this.showEditTaskModal = false;
        this.showConfirmDeleteTaskModal = false;
        this.showTaskDetailModal = false;
    }

    ngOnInit(): void {
        this.getTasks();
    }

    onFilterOptionChange(value: FilterOption) {
        const currentSortOption = value.sortOptions.find(opt => opt.value === this.sortOptionSelected.value);
        if (currentSortOption) {
            this.sortOptionSelected = currentSortOption;
        } else {
            this.sortOptionSelected = value.sortOptions[0];
        }
    }

    getTasks() {
        this.loadingTasks = true;
        this.disablePrevButton = true;
        this.disableNextButton = false;
        this.tasksService.getTasks(this.filterOptionSelected.value, this.sortOptionSelected.value, this.limitTasks).pipe(take(1)).subscribe({
            next: (tasks) => {
                console.log(tasks);

                this.tasksList = tasks.map(t => ({ loading: false, task: t }));
                this.disablePrevButton = true;
                this.disableNextButton = tasks.length < this.limitTasks;
                this.loadingTasks = false;
            },
            error: _ => {
                this.loadingTasks = false;
                this.disablePrevButton = true;
                this.disableNextButton = true;
            }
        });
    }

    applyFilter() {
        if (this.filterOptionSelected.value === this.lastFilterValue && this.sortOptionSelected.value === this.lastSortValue) return;
        this.lastFilterValue = this.filterOptionSelected.value;
        this.lastSortValue = this.sortOptionSelected.value;
        this.getTasks();
    }

    getTasksPage(directionPage: 'next' | 'prev') {
        this.loadingTasks = true;
        this.tasksService.getTasksPage(
            this.filterOptionSelected.value,
            this.sortOptionSelected.value,
            this.limitTasks,
            directionPage
        ).pipe(take(1)).subscribe({
            next: (tasks) => {
                if (tasks) {
                    this.tasksList = tasks.map(t => ({ loading: false, task: t }));
                }

                this.disableNextButton = directionPage === 'next' && (tasks === undefined || tasks.length < this.limitTasks);
                this.disablePrevButton = directionPage === 'prev' && tasks === undefined;

                this.loadingTasks = false;
            },
            error: _ => {
                this.loadingTasks = false;
                this.disableNextButton = true;
                this.disablePrevButton = true;
            }
        });
    }

    getCurrentTaskPage(taskItem?: { loading: boolean, task: Task }) {
        this.tasksService.getCurrentTasksPage(this.filterOptionSelected.value, this.sortOptionSelected.value, this.limitTasks)
            .pipe(take(1)).subscribe({
                next: (tasks) => {
                    if (tasks) {
                        this.tasksList = tasks.map(t => ({ loading: false, task: t }));
                    }
                    this.disableNextButton = tasks.length < this.limitTasks;
                    if (taskItem) taskItem.loading = false;
                },
                error: _ => {
                    this.disableNextButton = true;
                    this.disablePrevButton = true;
                    if (taskItem) {
                        taskItem.task.completed = !taskItem.task.completed;
                        taskItem.loading = false;
                    }
                }
            });
    }

    openNewTaskModal() {
        this.showNewTaskModal = true;
    }

    async onCloseNewTaskModal(modalValue: ModalCloseValue<Task>) {
        this.showNewTaskModal = false;
        if (modalValue.action === 'ok' && modalValue.value) {
            const result = await this.tasksService.addNewTask(modalValue.value);
            if (result instanceof Error) {
                this.alertControllerService.showAlert(this.containerRef, result.message, 'error', 2500);
            } else {
                this.alertControllerService.showAlert(this.containerRef, 'Tarea creada con exito', 'success', 2500);
            }
            this.getTasks();
        }
    }

    openEditTaskModal(task: Task, taskItem: { loading: boolean, task: Task }) {
        this.taskItemEdited = taskItem;
        const creation_date = Timestamp.fromMillis(task.creation_date.toMillis());
        const modification_date = Timestamp.fromMillis(task.modification_date.toMillis());
        this.taskSelectedToEdit = { ...task, creation_date, modification_date };
        this.showEditTaskModal = true;
    }

    async onCloseEditTaskModal(modalValue: ModalCloseValue<{ taskId: string, changeValues: Partial<Task> }>) {
        this.showEditTaskModal = false;
        if (modalValue.action !== 'ok' || !modalValue.value || !this.taskItemEdited || !this.taskItemEdited.task.id) return;

        this.taskItemEdited.loading = true;
        const result = await this.tasksService.updateTask(modalValue.value.taskId, modalValue.value.changeValues);
        if (result instanceof Error) {
            this.alertControllerService.showAlert(this.containerRef, result.message, 'error', 2500);
        } else {
            this.alertControllerService.showAlert(this.containerRef, 'Cambios guardados con exito', 'success', 2500);
            this.taskItemEdited.task = { ...this.taskItemEdited.task, ...modalValue.value.changeValues };
            if ((this.filterOptionSelected.value === TaskFilterOptionValues.COMPLETED ||
                this.filterOptionSelected.value === TaskFilterOptionValues.PENDING) &&
                this.taskSelectedToEdit?.completed !== modalValue.value.changeValues.completed) {

                const spliceIndex = this.tasksList.indexOf(this.taskItemEdited);
                this.tasksList.splice(spliceIndex, 1);
            }
        }
        if ((this.filterOptionSelected.value === TaskFilterOptionValues.COMPLETED ||
            this.filterOptionSelected.value === TaskFilterOptionValues.PENDING) &&
            this.taskSelectedToEdit?.completed !== modalValue.value.changeValues.completed) {
            this.getCurrentTaskPage(this.taskItemEdited);
        }
        this.taskItemEdited.loading = false;
    }

    async deleteTask(taskItem: { loading: boolean, task: Task }) {
        if (!taskItem.task.id) return;
        this.taskItemDelete = taskItem;
        this.showConfirmDeleteTaskModal = true;
    }

    async onCloseConfirmDeleteTaskModal(modalValue: ModalCloseValue<any>) {
        this.showConfirmDeleteTaskModal = false;
        if (modalValue.action === 'cancel' || !this.taskItemDelete || !this.taskItemDelete.task.id) return;

        this.taskItemDelete.loading = true;
        const result = await this.tasksService.deleteTask(this.taskItemDelete.task.id);
        if (result instanceof Error) {
            this.alertControllerService.showAlert(this.containerRef, result.message + '. Si ocurren mas errores, intenta recargar', 'error', 5000);
        } else {
            this.alertControllerService.showAlert(this.containerRef, 'Tarea eliminada correctamente', 'success', 2500);
            const spliceIndex = this.tasksList.indexOf(this.taskItemDelete);
            this.tasksList.splice(spliceIndex, 1);
        }
        this.taskItemDelete.loading = false;
        this.getCurrentTaskPage();
    }

    async markTask(complete: boolean, taskItem: { loading: boolean, task: Task }) {
        if (!taskItem.task.id) return;
        taskItem.loading = true;
        const result = await this.tasksService.updateTask(taskItem.task.id, { completed: complete });
        if (result instanceof Error) {
            taskItem.task.completed = !complete;
            this.alertControllerService.showAlert(this.containerRef, result.message + '. intenta recargar', 'error', 5000);
        }
        if (this.filterOptionSelected.value === TaskFilterOptionValues.COMPLETED ||
            this.filterOptionSelected.value === TaskFilterOptionValues.PENDING) {
            this.getCurrentTaskPage(taskItem);
            return;
        }
        taskItem.loading = false;
    }

    openTaskDetailModal(event: any, task: Task) {
        const preventElement = event.path?.find((el: any) => el instanceof HTMLButtonElement || el instanceof HTMLInputElement);
        if (preventElement) return;
        this.taskSelectedToDetail = task;
        this.showTaskDetailModal = true;
    }

    onCloseTaskDetailModal() {
        this.showTaskDetailModal = false;
    }

    emptyDescription(description: string) {
        return description.replace(/\s/g, '').length === 0;
    }

}
