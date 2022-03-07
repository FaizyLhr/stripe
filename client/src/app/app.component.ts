import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { PaymentService } from './core/services/payment.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  stripeTest: any;
  serverStripe: any;

  constructor(
    private paymentService: PaymentService,
    private fb: FormBuilder
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
