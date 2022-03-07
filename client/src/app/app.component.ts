import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StripePaymentElementComponent, StripeService } from 'ngx-stripe';

import { StripeElementsOptions } from '@stripe/stripe-js';

import { PaymentService } from './core/services/payment.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild(StripePaymentElementComponent)
  paymentElement!: StripePaymentElementComponent;
  stripeTest: any;
  serverStripe: any;
  elementsOptions: StripeElementsOptions = { locale: 'en' };
  paying!: boolean;
  flag: boolean = true;

  constructor(
    private http: HttpClient,
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private stripeService: StripeService
  ) {}

  ngOnInit() {
    this.stripeTest = this.fb.group({
      name: ['', [Validators.required]],
      amount: [, [Validators.required, Validators.pattern(/\d+/)]],
    });

    this.serverStripe = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      amount: [, [Validators.required, Validators.pattern(/\d+/)]],
    });
  }

  pay() {
    if (this.stripeTest.valid) {
      this.paying = true;
      this.stripeService
        .confirmPayment({
          elements: this.paymentElement?.elements,
          confirmParams: {
            payment_method_data: {
              billing_details: {
                name: this.stripeTest.get('name').value,
              },
            },
          },
          redirect: 'if_required',
        })
        .subscribe((result) => {
          this.paying = false;
          console.log('Result', result);
          if (result.error) {
            // Show error to your customer (e.g., insufficient funds)
            console.log({ success: false, error: result.error.message });
          } else {
            console.log(result);
            // The payment has been processed!
            if (result?.paymentIntent?.status === 'succeeded') {
              // Show a success message to your customer
              console.log({ success: true });
            }
          }
        });
    } else {
      console.log(this.stripeTest);
    }
  }

  createPayment() {
    this.paymentService.createPayment(this.stripeTest.value).subscribe(
      (res: any) => {
        console.log(res);
        this.elementsOptions.clientSecret = res.client_secret;
        this.flag = false;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  checkout() {
    this.paymentService.checkout().subscribe(
      (res) => {
        // if (res.error) {
        //   alert(res.error.message);
        // }
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
      // Check the server.js tab to see an example implementation
    );
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
}
