import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoFormModal } from './todo-form-modal.component';

describe('TodoFormModal', () => {
  let component: TodoFormModal;
  let fixture: ComponentFixture<TodoFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
