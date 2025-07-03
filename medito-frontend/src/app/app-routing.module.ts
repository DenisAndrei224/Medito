import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { CreatePostComponent } from './create-post/create-post.component';
import { AuthGuard } from './auth/auth.guard';
import { TeacherGuard } from './teacher.guard';
import { PostListComponent } from './post-list/post-list.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { MyRequestsComponent } from './my-requests/my-requests.component';
import { MyTeacherPageComponent } from './pages/my-teacher-page/my-teacher-page.component';
import { ManageResourcesComponent } from './manage-resources/manage-resources/manage-resources.component';
import { PostEditComponent } from './post-edit/post-edit.component';
import { CourseListComponent } from './courses/course-list/course-list.component';
import { CourseFormComponent } from './courses/course-form/course-form.component';
import { CourseStudentsComponent } from './courses/course-students/course-students.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'my-requests',
    component: MyRequestsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'my-teacher',
    component: MyTeacherPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'posts',
    children: [
      { path: '', component: PostListComponent },
      {
        path: 'create',
        component: CreatePostComponent,
        canActivate: [AuthGuard],
      },
      { path: ':id', component: PostDetailComponent },
      {
        path: ':id/edit',
        component: PostEditComponent,
        canActivate: [AuthGuard, TeacherGuard],
      },
    ],
  },
  {
    path: 'teacher/manage-resources',
    component: ManageResourcesComponent,
    canActivate: [AuthGuard, TeacherGuard], // User must be logged in AND be a teacher
  },
  {
    path: 'teacher/courses',
    canActivate: [AuthGuard, TeacherGuard],
    children: [
      { path: '', component: CourseListComponent },
      { path: 'new', component: CourseFormComponent },
      { path: ':id/edit', component: CourseFormComponent },
      { path: ':id/students', component: CourseStudentsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
