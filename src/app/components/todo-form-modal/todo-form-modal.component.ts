// src/app/components/todo-form-modal/todo-form-modal.component.ts
import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Todo, TodoCategory, TodoFormData, RecurringType } from '../../models/todo.model';

@Component({
  selector: 'app-todo-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()" *ngIf="isOpen">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Feladat szerkesztése' : 'Új feladat hozzáadása' }}</h2>
          <button class="close-btn" (click)="onClose()">&times;</button>
        </div>

        <form [formGroup]="todoForm" (ngSubmit)="onSubmit()" class="todo-form">
          <div class="form-group">
            <label for="title">Feladat címe *</label>
            <input
              id="title"
              type="text"
              formControlName="title"
              placeholder="Feladat címe"
              class="form-control"
              [class.error]="todoForm.get('title')?.invalid && todoForm.get('title')?.touched"
            >
            <div class="error-message" *ngIf="todoForm.get('title')?.invalid && todoForm.get('title')?.touched">
              A feladat címe kötelező!
            </div>
          </div>

          <div class="form-group">
            <label for="description">Leírás</label>
            <textarea
              id="description"
              formControlName="description"
              placeholder="Feladat leírása (opcionális)"
              class="form-control"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="category">Kategória *</label>
            <select id="category" formControlName="category" class="form-control">
              <option value="">Válassz kategóriát</option>
              <option *ngFor="let category of categories" [value]="category.value">
                {{ category.label }}
              </option>
            </select>
            <div class="error-message" *ngIf="todoForm.get('category')?.invalid && todoForm.get('category')?.touched">
              Válassz egy kategóriát!
            </div>
          </div>

          <div class="form-group">
            <label for="dueDate">Határidő</label>
            <input
              id="dueDate"
              type="datetime-local"
              formControlName="dueDate"
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="recurring">Ismétlődés</label>
            <select id="recurring" formControlName="recurring" class="form-control">
              <option value="none">Nincs ismétlődés</option>
              <option value="daily">Naponta</option>
              <option value="weekly">Hetente</option>
              <option value="monthly">Havonta</option>
            </select>
            <div class="recurring-info" *ngIf="todoForm.get('recurring')?.value !== 'none'">
              <small>ℹ️ Ismétlődő feladatok automatikusan létrejönnek a következő 12 alkalommal</small>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="onClose()">
              Mégse
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="todoForm.invalid">
              {{ isEditMode ? 'Módosítás' : 'Hozzáadás' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      color: #1f2937;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #374151;
    }

    .todo-form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-control.error {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .recurring-info {
      margin-top: 0.5rem;
    }

    .recurring-info small {
      color: #6b7280;
      font-style: italic;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .btn-primary:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #4b5563;
    }

    @media (max-width: 640px) {
      .modal-content {
        width: 95%;
        margin: 1rem;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class TodoFormModalComponent {
  @Input() isOpen = false;
  @Input() editTodo: Todo | null = null; // Szerkesztendő feladat
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<TodoFormData>();
  @Output() update = new EventEmitter<{id: string, data: TodoFormData}>(); // Új event

  todoForm: FormGroup;
  isEditMode = false;

  categories = [
    { value: TodoCategory.WORK, label: 'Munka' },
    { value: TodoCategory.HOME, label: 'Otthon' },
    { value: TodoCategory.SPORT, label: 'Sport' },
    { value: TodoCategory.OTHER, label: 'Egyéb' }
  ];

  constructor(private fb: FormBuilder) {
    this.todoForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      dueDate: [''],
      recurring: [RecurringType.NONE]
    });
  }

  ngOnChanges(): void {
    this.isEditMode = !!this.editTodo;

    if (this.editTodo && this.isOpen) {
      // Szerkesztési mód: form feltöltése meglévő adatokkal
      this.populateFormForEdit();
    }
  }

  private populateFormForEdit(): void {
    if (!this.editTodo) return;

    const dueDateFormatted = this.editTodo.dueDate
      ? this.formatDateForInput(this.editTodo.dueDate)
      : '';

    this.todoForm.patchValue({
      title: this.editTodo.title,
      description: this.editTodo.description || '',
      category: this.editTodo.category,
      dueDate: dueDateFormatted,
      recurring: this.editTodo.recurring || RecurringType.NONE
    });
  }

  private formatDateForInput(date: Date): string {
    // datetime-local input formátumhoz: YYYY-MM-DDTHH:mm
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.todoForm.valid) {
      const formData: TodoFormData = {
        title: this.todoForm.get('title')?.value,
        description: this.todoForm.get('description')?.value || undefined,
        category: this.todoForm.get('category')?.value,
        dueDate: this.todoForm.get('dueDate')?.value || undefined,
        recurring: this.todoForm.get('recurring')?.value
      };

      if (this.isEditMode && this.editTodo) {
        // Szerkesztési mód: update event
        this.update.emit({ id: this.editTodo.id, data: formData });
      } else {
        // Új feladat mód: submit event
        this.submit.emit(formData);
      }

      this.resetForm();
    }
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.todoForm.reset({
      recurring: RecurringType.NONE
    });
  }
}
