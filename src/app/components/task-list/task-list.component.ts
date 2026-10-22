import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskStoreService } from '../../services/task-store.service';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  searchText = '';
  statusFilter: TaskStatus | 'all' = 'all';
  priorityFilter: TaskPriority | 'all' = 'all';
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' | null = null;
  summary = { total: 0, completed: 0, inProgress: 0, overdue: 0 };
  currentPage = 1;
  pageSize = 5;
  draggedTaskId: string | null = null;
  activeDropStatus: TaskStatus | null = null;
  editingTaskId: string | null = null;
  editForm: FormGroup;
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly taskStore: TaskStoreService,
    private readonly fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: ['', Validators.required],
      priority: ['', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.taskStore.loadTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: (error) => {
        this.errorMessage = error.message ?? 'Unable to load tasks.';
      }
    });

    this.taskStore.tasks$.subscribe((tasks) => {
      this.tasks = tasks;
    });

    this.taskStore.summary$.subscribe((summary) => {
      this.summary = summary;
    });

    this.taskStore.loading$.subscribe((loading) => {
      this.loading = loading;
    });

    this.taskStore.error$.subscribe((message) => {
      this.errorMessage = message;
      this.showToast(message, 'error');
    });

    this.taskStore.success$.subscribe((message) => {
      this.successMessage = message;
      this.showToast(message, 'success');
    });
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter((task) => {
      const searchOk = task.title.toLowerCase().includes(this.searchText.toLowerCase());
      const statusOk = this.statusFilter === 'all' || task.status === this.statusFilter;
      const priorityOk = this.priorityFilter === 'all' || task.priority === this.priorityFilter;
      return searchOk && statusOk && priorityOk;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTasks.length / this.pageSize));
  }

  get paginatedTasks(): Task[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredTasks.slice(startIndex, endIndex);
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  onDragStart(taskId: string, event: DragEvent): void {
    this.draggedTaskId = taskId;
    event.dataTransfer?.setData('text/plain', taskId);
    event.dataTransfer!.effectAllowed = 'copyMove';
  }

  onDragEnd(event: DragEvent): void {
    this.draggedTaskId = null;
    this.activeDropStatus = null;
    event.dataTransfer?.clearData();
  }

  allowDrop(status: TaskStatus, event: DragEvent): void {
    event.preventDefault();
    this.activeDropStatus = status;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(newStatus: TaskStatus, event: DragEvent): void {
    event.preventDefault();

    const draggedId = this.draggedTaskId ?? event.dataTransfer?.getData('text/plain');
    if (!draggedId) {
      return;
    }

    const draggedTask = this.tasks.find((item) => item.id === draggedId);
    if (!draggedTask) {
      return;
    }

    const updatedTask = { ...draggedTask, status: newStatus };
    this.taskStore.updateTask(updatedTask).subscribe({
      error: (error) => {
        this.errorMessage = error.message ?? 'Unable to update task status.';
      }
    });

    this.draggedTaskId = null;
    this.activeDropStatus = null;
    event.dataTransfer?.clearData();
  }

  startInlineEdit(task: Task): void {
    this.editingTaskId = task.id;
    this.editForm.patchValue(task);
  }

  cancelInlineEdit(): void {
    this.editingTaskId = null;
    this.editForm.reset();
  }

  saveInlineEdit(taskId: string): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const updatedTask: Task = {
      id: taskId,
      ...this.editForm.value
    };

    this.taskStore.updateTask(updatedTask).subscribe({
      next: () => {
        this.editingTaskId = null;
        this.editForm.reset();
      },
      error: (error) => {
        this.errorMessage = error.message ?? 'Unable to update task.';
      }
    });
  }

  private showToast(message: string | null, type: 'success' | 'error'): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
      this.toastTimeoutId = null;
    }

    if (!message) {
      this.toastMessage = null;
      this.toastType = null;
      return;
    }

    this.toastMessage = message;
    this.toastType = type;

    this.toastTimeoutId = setTimeout(() => {
      this.toastMessage = null;
      this.toastType = null;
      this.toastTimeoutId = null;
    }, 3500);
  }

  deleteTask(taskId: string): void {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) {
      return;
    }

    this.taskStore.deleteTask(taskId).subscribe({
      error: (error) => {
        this.errorMessage = error.message ?? 'Unable to delete task.';
      }
    });
  }

  isOverdue(task: Task): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return task.status !== 'completed' && new Date(task.dueDate) < today;
  }
}
