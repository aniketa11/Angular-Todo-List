import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly apiUrl = 'http://localhost:3000/tasks';

  constructor(private readonly http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      catchError((error: HttpErrorResponse) => this.handleError('Failed to load tasks. Please try again.', error))
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task).pipe(
      catchError((error: HttpErrorResponse) => this.handleError('Failed to create task. Please try again.', error))
    );
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task).pipe(
      catchError((error: HttpErrorResponse) => this.handleError('Failed to update task. Please try again.', error))
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => this.handleError('Failed to delete task. Please try again.', error))
    );
  }

  private handleError(message: string, error: HttpErrorResponse): Observable<never> {
    return throwError(() => ({ message, status: error.status }));
  }
}
