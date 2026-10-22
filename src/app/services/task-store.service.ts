import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, finalize, map, Observable, catchError, tap, throwError } from 'rxjs';
import { Task, TaskSummary } from '../models/task.model';
import { TaskApiService } from './task-api.service';

@Injectable({ providedIn: 'root' })
export class TaskStoreService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly successSubject = new BehaviorSubject<string | null>(null);

  readonly tasks$ = this.tasksSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly success$ = this.successSubject.asObservable();

  readonly summary$: Observable<TaskSummary> = combineLatest([this.tasks$]).pipe(
    map(([tasks]) => this.buildSummary(tasks))
  );

  constructor(private readonly taskApi: TaskApiService) {}

  loadTasks(): Observable<Task[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.taskApi.getTasks().pipe(
      tap((tasks) => {
        this.tasksSubject.next(tasks);
        this.successSubject.next(null);
      }),
      catchError((error) => {
        this.errorSubject.next(error.message ?? 'Unable to load tasks.');
        return throwError(() => error);
      }),
      finalize(() => this.loadingSubject.next(false)),
      map((tasks) => tasks)
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.taskApi.createTask(task).pipe(
      tap((createdTask) => {
        const updatedTasks = [...this.tasksSubject.value, createdTask];
        this.tasksSubject.next(updatedTasks);
        this.successSubject.next('Task created successfully.');
        this.errorSubject.next(null);
      }),
      catchError((error) => {
        this.errorSubject.next(error.message ?? 'Unable to create task.');
        return throwError(() => error);
      })
    );
  }

  updateTask(task: Task): Observable<Task> {
    return this.taskApi.updateTask(task).pipe(
      tap((updatedTask) => {
        const currentTasks = this.tasksSubject.value;
        const updatedTasks = currentTasks.map((item) => item.id === updatedTask.id ? updatedTask : item);
        this.tasksSubject.next(updatedTasks);
        this.successSubject.next('Task updated successfully.');
        this.errorSubject.next(null);
      }),
      catchError((error) => {
        this.errorSubject.next(error.message ?? 'Unable to update task.');
        return throwError(() => error);
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.taskApi.deleteTask(id).pipe(
      tap(() => {
        const updatedTasks = this.tasksSubject.value.filter((task) => task.id !== id);
        this.tasksSubject.next(updatedTasks);
        this.successSubject.next('Task deleted successfully.');
        this.errorSubject.next(null);
      }),
      catchError((error) => {
        this.errorSubject.next(error.message ?? 'Unable to delete task.');
        return throwError(() => error);
      })
    );
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  clearSuccess(): void {
    this.successSubject.next(null);
  }

  private buildSummary(tasks: Task[]): TaskSummary {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = tasks.filter((task) => {
      const due = new Date(task.dueDate);
      return task.status !== 'completed' && due < today;
    }).length;

    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.status === 'completed').length,
      inProgress: tasks.filter((task) => task.status === 'in-progress').length,
      overdue
    };
  }
}
