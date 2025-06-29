// src/app/components/todo-list/todo-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Todo, TodoCategory, TodoFormData } from '../../models/todo.model';
import { TodoService } from '../../services/todo.services';
import { TodoFormModalComponent } from '../todo-form-modal/todo-form-modal.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoFormModalComponent],
  template: `
    <div class="todo-container">
      <header class="todo-header">
        <h1>📝 Feladatok</h1>
        <button class="add-btn" (click)="openModal()">
          ➕ Új feladat
        </button>
      </header>

      <div class="filter-sort-controls">
        <div class="filters">
          <button
            *ngFor="let category of filterCategories"
            class="filter-btn"
            [class.active]="selectedFilter === category.value"
            (click)="setFilter(category.value)"
          >
            {{ category.label }} ({{ getCategoryCount(category.value) }})
          </button>
        </div>

        <div class="sort-controls">
          <label for="sort">Rendezés:</label>
          <select id="sort" (change)="setSortBy($event)" class="sort-select">
            <option value="date">Határidő szerint</option>
            <option value="title">Cím szerint</option>
            <option value="category">Kategória szerint</option>
          </select>
        </div>
      </div>

      <div class="stats">
        <div class="stat-item">
          <span class="stat-number">{{ totalTodos }}</span>
          <span class="stat-label">Összes</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ completedTodos }}</span>
          <span class="stat-label">Kész</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ pendingTodos }}</span>
          <span class="stat-label">Váró</span>
        </div>
      </div>

      <div class="todo-list">
        <div *ngIf="(filteredTodos$ | async)?.length === 0" class="empty-state">
          <p>{{ selectedFilter === 'all' ? 'Nincs még feladat' : 'Nincs feladat ebben a kategóriában' }}</p>
          <button class="add-btn" (click)="openModal()">
            Első feladat hozzáadása
          </button>
        </div>

        <div
          *ngFor="let todo of filteredTodos$ | async; trackBy: trackByTodoId"
          class="todo-item"
          [class.completed]="todo.completed"
          [class.overdue]="isOverdue(todo)"
        >
          <div class="todo-content">
            <div class="todo-header-item">
              <input
                type="checkbox"
                [checked]="todo.completed"
                (change)="toggleComplete(todo.id)"
                class="todo-checkbox"
              >
              <h3 class="todo-title" [class.completed]="todo.completed">
                {{ todo.title }}
              </h3>
              <span class="category-badge" [attr.data-category]="todo.category">
                {{ todo.category }}
              </span>
            </div>

            <p *ngIf="todo.description" class="todo-description">
              {{ todo.description }}
            </p>

            <div class="todo-meta">
              <div class="todo-dates">
                <span *ngIf="todo.dueDate" class="due-date" [class.overdue]="isOverdue(todo)">
                  📅 {{ formatDate(todo.dueDate) }}
                </span>
                <span class="created-date">
                  Létrehozva: {{ formatDate(todo.createdAt) }}
                </span>
              </div>

              <div class="todo-info">
                <span *ngIf="todo.recurring && todo.recurring !== 'none'" class="recurring-badge">
                  🔄 {{ getRecurringLabel(todo.recurring) }}
                </span>
              </div>
            </div>
          </div>

          <div class="todo-actions">
            <button class="action-btn edit-btn" (click)="editTodo(todo)" title="Szerkesztés">
              ✏️
            </button>
            <button class="action-btn delete-btn" (click)="deleteTodo(todo.id)" title="Törlés">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <app-todo-form-modal
        [isOpen]="isModalOpen"
        [editTodo]="editingTodo"
        (close)="closeModal()"
        (submit)="addTodo($event)"
        (update)="updateTodo($event)"
      ></app-todo-form-modal>
    </div>
  `,
  styles: [`
    .todo-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .todo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .todo-header h1 {
      margin: 0;
      color: #1f2937;
      font-size: 2rem;
    }

    .add-btn {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    }

    .add-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }

    .filter-sort-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .filter-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .sort-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sort-select {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: bold;
      color: #3b82f6;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .todo-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #6b7280;
    }

    .empty-state p {
      margin-bottom: 1rem;
      font-size: 1.125rem;
    }

    .todo-item {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.2s;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .todo-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-color: #3b82f6;
    }

    .todo-item.completed {
      opacity: 0.7;
      background: #f9fafb;
    }

    .todo-item.overdue {
      border-left: 4px solid #ef4444;
    }

    .todo-content {
      flex: 1;
    }

    .todo-header-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .todo-checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .todo-title {
      margin: 0;
      font-size: 1.125rem;
      color: #1f2937;
      flex: 1;
    }

    .todo-title.completed {
      text-decoration: line-through;
      color: #6b7280;
    }

    .category-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      color: white;
    }

    .category-badge[data-category="Munka"] {
      background: #3b82f6;
    }

    .category-badge[data-category="Otthon"] {
      background: #10b981;
    }

    .category-badge[data-category="Sport"] {
      background: #f59e0b;
    }

    .category-badge[data-category="Egyéb"] {
      background: #8b5cf6;
    }

    .todo-description {
      margin: 0.5rem 0;
      color: #6b7280;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .todo-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.75rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .todo-dates {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .due-date {
      font-weight: 500;
    }

    .due-date.overdue {
      color: #ef4444;
      font-weight: bold;
    }

    .recurring-badge {
      background: #e0e7ff;
      color: #3730a3;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
    }

    .todo-actions {
      display: flex;
      gap: 0.5rem;
      margin-left: 1rem;
    }

    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s;
      font-size: 1rem;
    }

    .action-btn:hover {
      background: #f3f4f6;
    }

    .delete-btn:hover {
      background: #fee2e2;
    }

    @media (max-width: 640px) {
      .todo-container {
        padding: 0.5rem;
      }

      .todo-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .filter-sort-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .filters {
        justify-content: center;
      }

      .stats {
        justify-content: space-around;
      }

      .todo-item {
        flex-direction: column;
        gap: 1rem;
      }

      .todo-actions {
        align-self: flex-end;
        margin-left: 0;
      }

      .todo-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class TodoListComponent implements OnInit {
  todos$: Observable<Todo[]>;
  filteredTodos$: Observable<Todo[]>;
  isModalOpen = false;
  editingTodo: Todo | null = null; // Szerkesztés alatt álló feladat
  selectedFilter: string = 'all';
  sortBy: 'date' | 'title' | 'category' = 'date';

  filterCategories = [
    { value: 'all', label: 'Összes' },
    { value: TodoCategory.WORK, label: 'Munka' },
    { value: TodoCategory.HOME, label: 'Otthon' },
    { value: TodoCategory.SPORT, label: 'Sport' },
    { value: TodoCategory.OTHER, label: 'Egyéb' }
  ];

  totalTodos = 0;
  completedTodos = 0;
  pendingTodos = 0;
  allTodos: Todo[] = []; // Tároljuk az összes todo-t

  constructor(private todoService: TodoService) {
    this.todos$ = this.todoService.todos$;
    this.filteredTodos$ = this.todos$; // Kezdetben minden todo
  }

  ngOnInit(): void {
    // Feliratkozunk a todos változásaira
    this.todos$.subscribe(todos => {
      this.allTodos = todos;
      this.updateFilteredTodos();
      this.updateStats();
    });
  }

  openModal(): void {
    this.editingTodo = null; // Új feladat mód
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingTodo = null;
  }

  addTodo(formData: TodoFormData): void {
    this.todoService.addTodo(formData);
    this.closeModal();
    this.updateStats();
  }

  updateTodo(event: {id: string, data: TodoFormData}): void {
    // Frissítjük a feladatot a service-ben
    const updates: Partial<Todo> = {
      title: event.data.title,
      description: event.data.description,
      category: event.data.category,
      dueDate: event.data.dueDate ? new Date(event.data.dueDate) : undefined,
      recurring: event.data.recurring
    };

    this.todoService.updateTodo(event.id, updates);
    this.closeModal();
    this.updateStats();
  }

  toggleComplete(id: string): void {
    this.todoService.toggleComplete(id);
    this.updateStats();
  }

  deleteTodo(id: string): void {
    if (confirm('Biztosan törölni szeretnéd ezt a feladatot?')) {
      this.todoService.deleteTodo(id);
      this.updateStats();
    }
  }

  editTodo(todo: Todo): void {
    this.editingTodo = todo;
    this.isModalOpen = true;
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.updateFilteredTodos();
  }

  setSortBy(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value as 'date' | 'title' | 'category';
    this.updateFilteredTodos();
  }

  getCategoryCount(category: string): number {
    if (category === 'all') {
      return this.allTodos.length;
    } else {
      return this.allTodos.filter(todo => todo.category === category).length;
    }
  }

  isOverdue(todo: Todo): boolean {
    if (!todo.dueDate || todo.completed) return false;
    return new Date(todo.dueDate) < new Date();
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Ma';
    if (diffDays === 1) return 'Holnap';
    if (diffDays === -1) return 'Tegnap';
    if (diffDays > 0 && diffDays <= 7) return `${diffDays} nap múlva`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} napja`;

    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRecurringLabel(recurring: string): string {
    switch (recurring) {
      case 'daily': return 'Naponta';
      case 'weekly': return 'Hetente';
      case 'monthly': return 'Havonta';
      default: return '';
    }
  }

  trackByTodoId(index: number, todo: Todo): string {
    return todo.id;
  }

  private updateFilteredTodos(): void {
    // Szűrés kategória szerint
    let filtered = this.allTodos;

    if (this.selectedFilter !== 'all') {
      filtered = this.allTodos.filter(todo => todo.category === this.selectedFilter);
    }

    // Rendezés
    filtered = this.sortTodos(filtered, this.sortBy);

    // Observable frissítése
    this.filteredTodos$ = new Observable(observer => {
      observer.next(filtered);
    });
  }

  private sortTodos(todos: Todo[], sortBy: 'date' | 'title' | 'category'): Todo[] {
    return [...todos].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          // Befejezett feladatok hátra
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          // Majd határidő szerint
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'title':
          return a.title.localeCompare(b.title, 'hu');
        case 'category':
          return a.category.localeCompare(b.category, 'hu');
        default:
          return 0;
      }
    });
  }

  private updateStats(): void {
    this.totalTodos = this.allTodos.length;
    this.completedTodos = this.allTodos.filter(todo => todo.completed).length;
    this.pendingTodos = this.totalTodos - this.completedTodos;
  }
}
