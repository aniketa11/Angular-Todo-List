import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { TaskStoreService } from './task-store.service';
import { TaskApiService } from './task-api.service';
import { Task } from '../models/task.model';

describe('TaskStoreService', () => {
  let service: TaskStoreService;
  let apiService: jasmine.SpyObj<TaskApiService>;

  const seedTasks: Task[] = [
    {
      id: '1',
      title: 'Write README',
      description: 'Draft app notes',
      status: 'todo',
      priority: 'high',
      dueDate: '2026-08-05'
    }
  ];

  beforeEach(() => {
    apiService = jasmine.createSpyObj('TaskApiService', ['getTasks', 'createTask', 'updateTask', 'deleteTask']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TaskStoreService,
        { provide: TaskApiService, useValue: apiService }
      ]
    });

    service = TestBed.inject(TaskStoreService);
  });

  it('should load tasks into the single state source', (done) => {
    apiService.getTasks.and.returnValue(of(seedTasks));

    service.loadTasks().subscribe({
      next: () => {
        service.tasks$.subscribe((tasks) => {
          expect(tasks.length).toBe(1);
          expect(tasks[0].title).toBe('Write README');
          done();
        });
      },
      error: done.fail
    });
  });

  it('should derive task summary values from the current state', (done) => {
    apiService.getTasks.and.returnValue(of([
      { id: '1', title: 'A', description: '', status: 'completed', priority: 'low', dueDate: '2026-08-10' },
      { id: '2', title: 'B', description: '', status: 'in-progress', priority: 'medium', dueDate: '2026-08-05' },
      { id: '3', title: 'C', description: '', status: 'todo', priority: 'high', dueDate: '2026-08-03' }
    ]));

    service.loadTasks().subscribe({
      next: () => {
        service.summary$.subscribe((summary) => {
          expect(summary.total).toBe(3);
          expect(summary.completed).toBe(1);
          expect(summary.inProgress).toBe(1);
          expect(summary.overdue).toBe(1);
          done();
        });
      },
      error: done.fail
    });
  });
});
