import { User } from './user.model';
import { Resource } from './resource.model';

export interface MyTeacherPageData {
  teacher: User | null;
  resources: Resource[];
}
