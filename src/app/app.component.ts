import { Component } from '@angular/core';
import { TodoListComponent } from './components/todo-list/todo-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoListComponent],
  template: `
    <div class="app">
      <app-todo-list></app-todo-list>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 0;
    }

    @media (max-width: 640px) {
      .app {
        padding: 1rem 0;
      }
    }
  `]
})
export class AppComponent {
  title = 'TodoApp';
}
