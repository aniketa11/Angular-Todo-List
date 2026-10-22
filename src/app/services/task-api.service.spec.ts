import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskApiService } from './task-api.service';
import { Task } from '../models/task.model';

describe('TaskApiService', () => {
  let service: TaskApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskApiService]
    });

    service = TestBed.inject(TaskApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should surface a friendly error when the API fails', () => {
    let errorMessage = '';

    service.getTasks().subscribe({
      next: () => fail('expected request to fail'),
      error: (error) => {
        errorMessage = error.message;
      }
    });

    const request = httpMock.expectOne('http://localhost:3000/tasks');
    request.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(errorMessage).toBe('Failed to load tasks. Please try again.');
  });

  it('should create a task via POST', () => {
    const payload: Task = {
      id: '9',
      title: 'Ship task app',
      description: 'Ship the demo app',
      status: 'todo',
      priority: 'medium',
      dueDate: '2026-08-06'
    };

    service.createTask(payload).subscribe((task) => {
      expect(task.id).toBe('9');
    });

    const request = httpMock.expectOne('http://localhost:3000/tasks');
    expect(request.request.method).toBe('POST');
    request.flush(payload);
  });
});
