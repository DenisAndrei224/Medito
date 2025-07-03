import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthInterceptor } from './services/auth.interceptor';
import { ProfileComponent } from './profile/profile.component';
import { CreatePostComponent } from './create-post/create-post.component';
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

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    RegisterComponent,
    LoginComponent,
    ProfileComponent,
    CreatePostComponent,
    PostListComponent,
    PostDetailComponent,
    MyRequestsComponent,
    MyTeacherPageComponent,
    ManageResourcesComponent,
    PostEditComponent,
    CourseListComponent,
    CourseFormComponent,
    CourseStudentsComponent,
    HomeComponent,
    AboutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
