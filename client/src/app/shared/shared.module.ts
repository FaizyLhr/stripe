import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

const SHARED_PIPES: any = [];

const SHARED_COMPONENTS: any = [];

const SHARED_DIRECTIVES: any = [];

const SHARED_MODULES: any = [];

@NgModule({
  declarations: [SHARED_PIPES, SHARED_COMPONENTS, SHARED_DIRECTIVES],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    SHARED_MODULES,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    SHARED_PIPES,
    SHARED_COMPONENTS,
    SHARED_MODULES,
    SHARED_DIRECTIVES,
  ],
})
export class SharedModule {}
