import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StripeService } from 'ngx-stripe';
import { switchMap } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(
    private apiService: ApiService,
    private stripeService: StripeService
  ) {}

  createPayment(data: number) {
    return this.apiService.post('/payment/create-payment-intent', data);
  }

  checkout() {
    return this.apiService.post(`/payment/create-checkout-session`).pipe(
      switchMap((session) => {
        return this.stripeService.redirectToCheckout({ sessionId: session.id });
      })
    );
  }

  makePayment(token: string) {
    return this.apiService.post('/payment/payments', token);
  }
}
