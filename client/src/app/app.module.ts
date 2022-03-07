import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Import your library
import { NgxStripeModule } from 'ngx-stripe';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { SuccessComponent } from './success/success.component';
import { CancelComponent } from './cancel/cancel.component';

@NgModule({
  declarations: [AppComponent, SuccessComponent, CancelComponent],
  imports: [
    AppRoutingModule,
    CoreModule,
    SharedModule,
    NgxStripeModule.forRoot(
      'pk_test_51KZD9qJwfiEbsL4t85ur6Xu6aj7qZxlMI2Nn8LxMVqoV5PoHGKqLgGkEfWYiE808S8Ce9AWd4IM6UVCehiJSiWSI00Yo5dTn72'
    ),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
