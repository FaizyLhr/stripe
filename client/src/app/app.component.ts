import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { StripeCardComponent, StripeService } from 'ngx-stripe';

import { PaymentService } from './core/services/payment.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild(StripeCardComponent) card: StripeCardComponent | any;
  serverStripe: any;
  stripeTest!: FormGroup;

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: '300',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0',
        },
      },
    },
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en',
  };
  token: any;

  constructor(
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private stripeService: StripeService
  ) {}

  ngOnInit() {
    this.serverStripe = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      amount: [, [Validators.required, Validators.pattern(/\d+/)]],
    });
  }

  // Server Side implementation
  makePayment() {
    console.log(this.serverStripe.value);
    this.paymentService.makePayment(this.serverStripe.value).subscribe(
      (res: any) => {
        console.log(res);
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  createToken(): void {
    console.log(this.serverStripe.value);
    const name = this.serverStripe.value.name;
    this.stripeService
      .createToken(this.card.element, { name })
      .subscribe((result) => {
        if (result.token) {
          // Use the token
          console.log(result.token);
          this.token = result.token;
        } else if (result.error) {
          // Error creating the token
          console.log(result.error.message);
        }
      });
  }

  pay() {
    console.log(this.token);
    console.log(this.serverStripe.value);
    this.serverStripe.value.token = this.token;
    this.paymentService.pay(this.serverStripe.value).subscribe(
      (result: any) => {
        console.log(result);
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
}
