import { TestBed } from '@angular/core/testing';

import { TeacherResourceService } from './teacher-resource.service';

describe('TeacherResourceService', () => {
  let service: TeacherResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeacherResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
