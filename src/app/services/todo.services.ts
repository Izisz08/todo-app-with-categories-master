import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Todo, TodoCategory, TodoFormData, RecurringType } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  public todos$: Observable<Todo[]> = this.todosSubject.asObservable();

  constructor() {
    this.loadTodos();
  }

  private loadTodos(): void {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      const todos = JSON.parse(storedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      }));
      this.todosSubject.next(todos);
    }
  }

  private saveTodos(todos: Todo[]): void {
    localStorage.setItem('todos', JSON.stringify(todos));
    this.todosSubject.next(todos);
  }

  addTodo(formData: TodoFormData): void {
    const todos = this.todosSubject.value;
    const newTodos: Todo[] = [];

    const baseTodo = this.createBaseTodo(formData);
    newTodos.push(baseTodo);

    // Ismétlődő feladatok generálása
    if (formData.recurring !== RecurringType.NONE && formData.dueDate) {
      const recurringTodos = this.generateRecurringTodos(baseTodo, formData.recurring);
      newTodos.push(...recurringTodos);
    }

    this.saveTodos([...todos, ...newTodos]);
  }

  private createBaseTodo(formData: TodoFormData): Todo {
    return {
      id: this.generateId(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      completed: false,
      createdAt: new Date(),
      recurring: formData.recurring
    };
  }

  private generateRecurringTodos(baseTodo: Todo, recurring: RecurringType): Todo[] {
    const recurringTodos: Todo[] = [];
    if (!baseTodo.dueDate) return recurringTodos;

    const baseDate = new Date(baseTodo.dueDate);

    // Generáljunk 12 ismétlődő feladatot
    for (let i = 1; i <= 12; i++) {
      const newDate = new Date(baseDate);

      switch (recurring) {
        case RecurringType.DAILY:
          newDate.setDate(baseDate.getDate() + i);
          break;
        case RecurringType.WEEKLY:
          newDate.setDate(baseDate.getDate() + (i * 7));
          break;
        case RecurringType.MONTHLY:
          newDate.setMonth(baseDate.getMonth() + i);
          break;
      }

      recurringTodos.push({
        ...baseTodo,
        id: this.generateId(),
        dueDate: newDate,
        createdAt: new Date()
      });
    }

    return recurringTodos;
  }

  updateTodo(id: string, updates: Partial<Todo>): void {
    const todos = this.todosSubject.value;
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates };
      this.saveTodos(todos);
    }
  }

  deleteTodo(id: string): void {
    const todos = this.todosSubject.value;
    const filteredTodos = todos.filter(todo => todo.id !== id);
    this.saveTodos(filteredTodos);
  }

  toggleComplete(id: string): void {
    const todos = this.todosSubject.value;
    const todo = todos.find(t => t.id === id);
    if (todo) {
      this.updateTodo(id, { completed: !todo.completed });
    }
  }

  getTodosByCategory(category: TodoCategory): Observable<Todo[]> {
    return new Observable(observer => {
      this.todos$.subscribe(todos => {
        observer.next(todos.filter(todo => todo.category === category));
      });
    });
  }

  getSortedTodos(sortBy: 'date' | 'title' | 'category' = 'date'): Observable<Todo[]> {
    return new Observable(observer => {
      this.todos$.subscribe(todos => {
        const sorted = [...todos].sort((a, b) => {
          switch (sortBy) {
            case 'date':
              if (!a.dueDate && !b.dueDate) return 0;
              if (!a.dueDate) return 1;
              if (!b.dueDate) return -1;
              return a.dueDate.getTime() - b.dueDate.getTime();
            case 'title':
              return a.title.localeCompare(b.title);
            case 'category':
              return a.category.localeCompare(b.category);
            default:
              return 0;
          }
        });
        observer.next(sorted);
      });
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
