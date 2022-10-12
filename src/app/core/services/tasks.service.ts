import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, QueryFn, QuerySnapshot } from '@angular/fire/compat/firestore';
import { map, switchMap } from 'rxjs/operators';
import { WhereFilterOp, OrderByDirection } from 'firebase/firestore';
import { TaskFilterOptionValues, SortOptionsValues } from '../enums';
import { Task } from '../interfaces/task.interface';
import { AuthService } from 'src/app/core/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TasksService {

    private firstTask: any;
    private firstTaskPage: any;
    private secondTaskPage: any;
    private lastTaskPage: any;

    constructor(private firestore: AngularFirestore, private authService: AuthService) { }

    getTasks(filterValue: number, sortValue: number, limit: number) {

        return this.getTasksQuery(filterValue, sortValue, limit).pipe(
            switchMap(queryFn => {
                return this.firestore.collection<Task>('tasks', queryFn).get()
                    .pipe(
                        map(snap => {

                            if (snap.docs.length > 0) {
                                this.firstTask = snap.docs[0];
                                this.firstTaskPage = snap.docs[0];
                                this.lastTaskPage = snap.docs[snap.docs.length - 1];
                            }

                            if (snap.docs.length > 1) {
                                this.secondTaskPage = snap.docs[1];
                            }

                            return this.getDataTasks(snap);
                        })
                    );
            })
        );
    }

    getTasksPage(filterValue: number, sortValue: number, limit: number, directionPage?: 'next' | 'prev') {
        return this.getTasksQuery(filterValue, sortValue, limit, directionPage).pipe(
            switchMap(query => {
                return this.firestore.collection<Task>('tasks', query).get()
                    .pipe(map(snap => {

                        if (snap.docs.length === 0) return undefined;

                        if (snap.docs.length > 0) {
                            this.firstTaskPage = snap.docs[0];
                            this.lastTaskPage = snap.docs[snap.docs.length - 1];
                        }

                        if (snap.docs.length > 1) {
                            this.secondTaskPage = snap.docs[1];
                        }

                        const tasks = this.getDataTasks(snap);

                        return tasks;
                    }));
            })
        );
    }

    getCurrentTasksPage(filterValue: number, sortValue: number, limit: number) {
        return this.getTasksQuery(filterValue, sortValue, limit, 'curr').pipe(
            switchMap(query => {
                return this.firestore.collection<Task>('tasks', query).get()
                    .pipe(
                        map(snap => {
                            if (snap.docs.length > 0) {
                                this.firstTask = snap.docs[0];
                                this.firstTaskPage = snap.docs[0];
                                this.lastTaskPage = snap.docs[snap.docs.length - 1];
                            }

                            const tasks = this.getDataTasks(snap);
                            return tasks;
                        })
                    );
            })
        );
    }

    async addNewTask(task: Task) {
        try {
            const newTaskRef = this.firestore.collection<Task>('tasks').add(task);
            return newTaskRef;
        } catch (error) {
            return new Error('Problema al guardar tarea');
        }
    }

    async deleteTask(taskId: string) {
        try {
            if (this.firstTaskPage.data().id === taskId) {
                await this.firestore.doc(this.firstTaskPage).delete();
                this.firstTaskPage = this.secondTaskPage;
            }

            if (this.secondTaskPage.data().id === taskId) {
                await this.firestore.doc(this.secondTaskPage).delete();
            }

            await this.firestore.doc<Task>(`tasks/${taskId}`).delete();

            return taskId;
        } catch (error) {
            return new Error('Problema al eliminar tarea');
        }
    }

    async updateTask(taskId: string, changeValues: Partial<Task>) {
        try {
            await this.firestore.doc<Task>(`tasks/${taskId}`).update(changeValues);
            return taskId;
        } catch (error) {
            return new Error('Problema al guardar cambios');
        }
    }

    private getDataTasks(snapshot: QuerySnapshot<Task>) {
        const values: Task[] = [];

        snapshot.forEach(doc => {
            const data: any = doc.data();

            values.push({
                id: doc.id,
                name: data.name,
                description: data.description,
                completed: data.completed,
                priority: data.priority,
                creation_date: data.creation_date,
                modification_date: data.modification_date,
                user_id: data.user_id
            });
        });
        return values;
    }

    private getTasksQuery(filterValue: number, sortValue: number, limit: number, directionPage?: 'next' | 'prev' | 'curr'): Observable<QueryFn<DocumentData>> {
        return this.authService.currentUser.pipe(
            map(user => {
                if (!user) throw new Error('No se encontro usuario');

                let filterQueryArgs: { field: string, option: WhereFilterOp, value: any } = {
                    field: '',
                    option: '!=',
                    value: undefined
                };

                let sortQueryArgs: { field: string, option: OrderByDirection } = {
                    field: 'creation_date',
                    option: 'desc'
                };

                if (filterValue === TaskFilterOptionValues.COMPLETED) {
                    filterQueryArgs = { field: 'completed', option: '==', value: true };
                }

                if (filterValue === TaskFilterOptionValues.PENDING) {
                    filterQueryArgs = { field: 'completed', option: '==', value: false };
                }

                if (filterValue !== TaskFilterOptionValues.ALL && filterValue !== TaskFilterOptionValues.PENDING && filterValue !== TaskFilterOptionValues.COMPLETED) {
                    filterQueryArgs = { field: 'priority', option: '==', value: filterValue };
                }

                if (sortValue === SortOptionsValues.OLDEST) {
                    sortQueryArgs = { field: 'creation_date', option: 'asc' };
                }

                if (filterQueryArgs.field !== '') {

                    if (directionPage && directionPage === 'next') {
                        return (ref) => ref
                            .where('user_id', '==', user?.uid)
                            .where(filterQueryArgs.field, filterQueryArgs.option, filterQueryArgs.value)
                            .orderBy(sortQueryArgs.field, sortQueryArgs.option)
                            .startAfter(this.lastTaskPage)
                            .limit(limit);
                    }

                    if (directionPage && directionPage === 'prev') {
                        return (ref) => ref
                            .where('user_id', '==', user?.uid)
                            .where(filterQueryArgs.field, filterQueryArgs.option, filterQueryArgs.value)
                            .orderBy(sortQueryArgs.field, sortQueryArgs.option)
                            .endBefore(this.firstTaskPage)
                            .limitToLast(limit + 1);
                    }

                    if (directionPage && directionPage === 'curr') {
                        return (ref) => ref
                            .where('user_id', '==', user?.uid)
                            .where(filterQueryArgs.field, filterQueryArgs.option, filterQueryArgs.value)
                            .orderBy(sortQueryArgs.field, sortQueryArgs.option)
                            .startAt(this.firstTaskPage)
                            .limit(limit);
                    }

                    return (ref) => ref
                        .where('user_id', '==', user?.uid)
                        .where(filterQueryArgs.field, filterQueryArgs.option, filterQueryArgs.value)
                        .orderBy(sortQueryArgs.field, sortQueryArgs.option)
                        .limit(limit);
                }

                if (directionPage && directionPage === 'next') {
                    return (ref) => ref
                        .where('user_id', '==', user?.uid)
                        .orderBy(sortQueryArgs.field, sortQueryArgs.option)
                        .startAfter(this.lastTaskPage)
                        .limit(limit);
                }

                if (directionPage && directionPage === 'prev') {
                    return (ref) => ref
                        .where('user_id', '==', user?.uid)
                        .orderBy(sortQueryArgs.field, sortQueryArgs.option)
                        .endBefore(this.firstTaskPage)
                        .limitToLast(limit + 1);
                }

                if (directionPage && directionPage === 'curr') {
                    return (ref) => ref
                        .where('user_id', '==', user?.uid)
                        .orderBy(sortQueryArgs.field, sortQueryArgs.option)
                        .startAt(this.firstTaskPage)
                        .limit(limit);
                }

                return (ref) => ref.where('user_id', '==', user?.uid).orderBy(sortQueryArgs.field, sortQueryArgs.option).limit(limit);
            })
        );
    }
}
