import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { TaskFormComponent } from './task-form.component';
import { TaskStoreService } from '../../services/task-store.service';
import { TaskApiService } from '../../services/task-api.service';

describe('TaskFormComponent', () => {
  let fixture: ComponentFixture<TaskFormComponent>;
  let component: TaskFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskFormComponent],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [
        {
          provide: TaskStoreService,
          useValue: {
            createTask: () => of({}),
            updateTask: () => of({}),
            loadTasks: () => of([]),
            tasks$: of([]),
            summary$: of({ total: 0, completed: 0, inProgress: 0, overdue: 0 })
          }
        },
        {
          provide: TaskApiService,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should require a title with at least 3 characters', () => {
    component.taskForm.controls['title'].setValue('ab');
    component.taskForm.controls['title'].markAsTouched();

    expect(component.taskForm.controls['title'].invalid).toBeTrue();
    expect(component.taskForm.controls['title'].errors?.['minlength']).toBeTruthy();
  });

  it('should require status and priority before submit', () => {
    component.taskForm.controls['status'].setValue('');
    component.taskForm.controls['priority'].setValue('');

    expect(component.taskForm.controls['status'].invalid).toBeTrue();
    expect(component.taskForm.controls['priority'].invalid).toBeTrue();
  });
});
