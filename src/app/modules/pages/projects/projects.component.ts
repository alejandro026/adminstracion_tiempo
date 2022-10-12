import { Component, HostBinding, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { filterOwnProjectsOptions, filterCollaboratorProjectsOptions } from 'src/app/core/constants';
import { ProjectFilterOptionValues } from 'src/app/core/enums';
import { FilterOption } from 'src/app/core/interfaces/filter-option.interface';
import { Project } from 'src/app/core/interfaces/project.interface';
import { SelectOption } from 'src/app/core/interfaces/select-option.interface';
import { AlertControllerService } from 'src/app/core/services/alert-controller.service';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

    @HostBinding('id') projectsContainerId = 'projects-page-container';

    filterOwnOptions: FilterOption[];
    filterCollaboratorOptions: FilterOption[];
    sortOptions: SelectOption[];
    filterOptionSelected: FilterOption;
    sortOptionSelected: SelectOption;

    projects: Project[];
    showProjectOwner: boolean;

    loadingProjects: boolean;

    pageLimit: number;
    disableNextButton: boolean;
    disablePrevButton: boolean;

    constructor(
        private projectsService: ProjectsService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private alertService: AlertControllerService,
        private containerRef: ViewContainerRef
    ) {
        this.filterOwnOptions = filterOwnProjectsOptions;
        this.filterCollaboratorOptions = filterCollaboratorProjectsOptions;
        this.filterOptionSelected = this.filterOwnOptions[0];
        this.sortOptions = this.filterOptionSelected.sortOptions;
        this.sortOptionSelected = this.sortOptions[0];

        this.projects = [];
        this.showProjectOwner = false;

        this.loadingProjects = true;

        this.pageLimit = 5;
        this.disableNextButton = false;
        this.disablePrevButton = true;
    }

    ngOnInit(): void {
        this.getProjects();
    }

    getProjects() {
        this.loadingProjects = true;
        this.projectsService
            .getProjects(this.filterOptionSelected.value, this.sortOptionSelected.value, this.pageLimit)
            .pipe(
                take(1)
            ).subscribe({
                next: projects => {
                    this.projects = projects;
                    this.loadingProjects = false;
                    this.disablePrevButton = true;
                    this.disableNextButton = projects.length < this.pageLimit;
                    this.showProjectOwner = this.filterOptionSelected.value === ProjectFilterOptionValues.COLLABORATOR ||
                        this.filterOptionSelected.value === ProjectFilterOptionValues.COLLAB_COMPLETED ||
                        this.filterOptionSelected.value === ProjectFilterOptionValues.COLLAB_IN_PROGRESS;
                },
                error: _ => {
                    this.alertService.showAlert(this.containerRef, 'Problema al obtener los proyectos', 'error', 3000);
                    this.loadingProjects = false;
                    this.disableNextButton = true;
                    this.disablePrevButton = true;
                }
            });
    }

    getProjectsPage(paginationDirection: 'next' | 'prev') {
        this.loadingProjects = true;
        this.projectsService.getProjectsPage(
            this.filterOptionSelected.value,
            this.sortOptionSelected.value,
            this.pageLimit,
            paginationDirection
        ).pipe(take(1)).subscribe({
            next: (projects) => {
                if (projects) {
                    this.projects = projects;
                }

                this.disableNextButton = paginationDirection === 'next' && (projects === undefined || projects.length < this.pageLimit);
                this.disablePrevButton = paginationDirection === 'prev' && projects === undefined;

                this.loadingProjects = false;
            },
            error: _ => {
                this.alertService.showAlert(this.containerRef, 'Error al obtener los proyectos', 'error', 3000);
                this.loadingProjects = false;
                this.disableNextButton = true;
                this.disablePrevButton = true;
            }
        });
    }

    applyFilter() {
        this.getProjects();
    }

    showProject(project: Project) {
        if (this.filterOptionSelected.value === ProjectFilterOptionValues.OWN ||
            this.filterOptionSelected.value === ProjectFilterOptionValues.OWN_COMPLETED ||
            this.filterOptionSelected.value === ProjectFilterOptionValues.OWN_IN_PROGRESS) {

            this.router.navigate(['o', project.id], { relativeTo: this.activatedRoute });
        } else {
            this.router.navigate(['c', project.id], { relativeTo: this.activatedRoute });
        }
    }

}
