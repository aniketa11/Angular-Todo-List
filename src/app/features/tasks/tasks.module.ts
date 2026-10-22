import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';

const routes: Routes = [
  { path: '', component: TaskListComponent },
  { path: 'new', component: TaskFormComponent },
  { path: ':id/edit', component: TaskFormComponent }
];

@NgModule({
  declarations: [TaskListComponent, TaskFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class TasksModule { }
