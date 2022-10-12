import { TaskFilterOptionValues, SortOptionsValues, ProjectFilterOptionValues } from './enums';
import { FilterOption } from './interfaces/filter-option.interface';
import { SelectOption } from './interfaces/select-option.interface';

const sortTasksOptions: SelectOption[] = [
    {
        text: 'Mas recientes',
        value: SortOptionsValues.RECENT
    },
    {
        text: 'Mas antiguas',
        value: SortOptionsValues.OLDEST
    }
];

const sortProjectsOptions: SelectOption[] = [
    {
        text: 'Mas recientes',
        value: SortOptionsValues.RECENT
    },
    {
        text: 'Mas antiguos',
        value: SortOptionsValues.OLDEST
    }
];

const filterTasksOptions: FilterOption[] = [
    {
        text: 'Todas',
        value: TaskFilterOptionValues.ALL,
        sortOptions: sortTasksOptions
    },
    {
        text: 'Completadas',
        value: TaskFilterOptionValues.COMPLETED,
        sortOptions: sortTasksOptions
    },
    {
        text: 'Pendientes',
        value: TaskFilterOptionValues.PENDING,
        sortOptions: sortTasksOptions
    }
];

const filterTasksPriorityOptions: FilterOption[] = [
    {
        text: 'Alta',
        value: TaskFilterOptionValues.PRIORITY_HIGH,
        sortOptions: sortTasksOptions
    },
    {
        text: 'Media',
        value: TaskFilterOptionValues.PRIORITY_MEDIUM,
        sortOptions: sortTasksOptions
    },
    {
        text: 'Baja',
        value: TaskFilterOptionValues.PRIORITY_LOW,
        sortOptions: sortTasksOptions
    },
    {
        text: 'Ninguna',
        value: TaskFilterOptionValues.NO_PRIORITY,
        sortOptions: sortTasksOptions
    }
];

const filterOwnProjectsOptions: FilterOption[] = [
    {
        value: ProjectFilterOptionValues.OWN,
        text: 'Todos',
        sortOptions: sortProjectsOptions
    },
    {
        value: ProjectFilterOptionValues.OWN_COMPLETED,
        text: 'Completados',
        sortOptions: sortProjectsOptions
    },
    {
        value: ProjectFilterOptionValues.OWN_IN_PROGRESS,
        text: 'En progreso',
        sortOptions: sortProjectsOptions
    }
];

const filterCollaboratorProjectsOptions: FilterOption[] = [
    {
        value: ProjectFilterOptionValues.COLLABORATOR,
        text: 'Todos',
        sortOptions: sortProjectsOptions
    },
    {
        value: ProjectFilterOptionValues.COLLAB_COMPLETED,
        text: 'Completados',
        sortOptions: sortProjectsOptions
    },
    {
        value: ProjectFilterOptionValues.COLLAB_IN_PROGRESS,
        text: 'En progreso',
        sortOptions: sortProjectsOptions
    }
];

export {
    filterTasksOptions,
    filterTasksPriorityOptions,
    filterOwnProjectsOptions,
    filterCollaboratorProjectsOptions
};
