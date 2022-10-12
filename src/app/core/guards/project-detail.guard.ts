import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ProjectsService } from '../services/projects.service';

@Injectable({
    providedIn: 'root'
})
export class ProjectDetailGuard implements CanActivate {

    constructor(
        private projectsService: ProjectsService,
        private authService: AuthService,
        private router: Router
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        if (!route.params['project_id']) return false;
        return this.authService.currentUser.pipe(
            switchMap(user => {
                return this.projectsService.getProject(route.params['project_id']).pipe(
                    map(project => {
                        const result = project.user_id === user?.uid;
                        if (!result) this.router.navigate(['app', 'projects']);
                        return result;
                    }),
                    catchError(_ => {
                        this.router.navigate(['app', 'projects']);
                        return of(false);
                    })
                );
            }),
            catchError(_ => {
                this.router.navigate(['app', 'projects']);
                return of(false);
            })
        );
    }

}
