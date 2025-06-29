export interface Todo {
  id: string;
  title: string;
  description?: string;
  category: TodoCategory;
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  recurring?: RecurringType;
}

export enum TodoCategory {
  WORK = 'Munka',
  HOME = 'Otthon',
  SPORT = 'Sport',
  OTHER = 'Egyéb'
}

export enum RecurringType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface TodoFormData {
  title: string;
  description?: string;
  category: TodoCategory;
  dueDate?: string;
  recurring: RecurringType;
}
