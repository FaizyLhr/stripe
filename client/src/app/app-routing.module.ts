import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CancelComponent } from './cancel/cancel.component';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'cancel', component: CancelComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
