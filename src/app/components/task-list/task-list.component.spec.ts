import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { TaskListComponent } from './task-list.component';
import { TaskStoreService } from '../../services/task-store.service';

describe('TaskListComponent', () => {
  let fixture: ComponentFixture<TaskListComponent>;
  let component: TaskListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskListComponent],
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule],
      providers: [
        {
          provide: TaskStoreService,
          useValue: {
            loadTasks: () => of([]),
            deleteTask: () => of({}),
            updateTask: () => of({}),
            tasks$: of([]),
            summary$: of({ total: 0, completed: 0, inProgress: 0, overdue: 0 }),
            loading$: of(false),
            error$: of(null),
            success$: of(null)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the list component', () => {
    expect(component).toBeTruthy();
  });

  it('should start inline edit mode for a selected task', () => {
    const task = {
      id: '1',
      title: 'Prepare sprint review',
      description: 'Collect notes',
      status: 'todo' as const,
      priority: 'medium' as const,
      dueDate: '2026-08-10'
    };

    component.startInlineEdit(task);

    expect(component.editingTaskId).toBe('1');
    expect(component.editForm.get('title')?.value).toBe('Prepare sprint review');
    expect(component.editForm.get('status')?.value).toBe('todo');
  });
});
