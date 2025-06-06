import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTeacherPageComponent } from './my-teacher-page.component';

describe('MyTeacherPageComponent', () => {
  let component: MyTeacherPageComponent;
  let fixture: ComponentFixture<MyTeacherPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyTeacherPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTeacherPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
