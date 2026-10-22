import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../models/task.model';
import { TaskStoreService } from '../../services/task-store.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly taskStore: TaskStoreService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: ['', Validators.required],
      priority: ['', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.taskId;

    this.taskStore.loadTasks().subscribe({
      next: (tasks) => {
        if (this.isEditMode) {
          const task = tasks.find((item) => item.id === this.taskId);
          if (task) {
            this.taskForm.patchValue(task);
          }
        }
      },
      error: () => {}
    });

    this.taskStore.tasks$.subscribe((tasks) => {
      if (this.isEditMode) {
        const task = tasks.find((item) => item.id === this.taskId);
        if (task) {
          this.taskForm.patchValue(task);
        }
      }
    });
  }

  submit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const task: Task = {
      id: this.taskId ?? crypto.randomUUID(),
      ...this.taskForm.value
    };

    const request$ = this.isEditMode
      ? this.taskStore.updateTask(task)
      : this.taskStore.createTask(task);

    request$.subscribe({
      next: () => this.router.navigateByUrl('/tasks'),
      error: () => this.router.navigateByUrl('/tasks')
    });
  }

  get titleControl() {
    return this.taskForm.get('title');
  }
}
