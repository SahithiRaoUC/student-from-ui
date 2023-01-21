import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import * as moment from "moment";
import {PdfService} from "../service/pdf.service";
import {Register} from "../model/register";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  submitted = false;

  userData: any;
  successSubmission = false;
  errorSubmission = false;

  constructor(private fb: FormBuilder, private pdfSaveService: PdfService) {
  }

  ngOnDestroy(): void {
    this.clearForm();
  }

  clearForm(): void {
    this.successSubmission = false;
    this.errorSubmission = false;
    this.submitted = false;
  }

  ngOnInit() {
    this.registerForm = this.fb.group({
      course: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(4)]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required, this.endDateValidator('startDate')]],
      jacsCode: ['', [Validators.required]]
    });
  }

  get course() {
    return this.registerForm?.get("course");
  }

  get startDate() {
    return this.registerForm?.get("startDate");
  }

  get endDate() {
    return this.registerForm?.get("endDate");
  }

  get jacsCode() {
    return this.registerForm?.get("jacsCode");
  }

  onSubmit() {
    this.submitted = true;
    if (this.registerForm?.valid) {

      this.pdfSaveService.getValuesFromPdf().subscribe((response: Register) => {
        console.log("Received Response", response);

        this.course?.setErrors(response.course === this.course?.value ? null : {valueNotMatch: true});
        this.startDate?.setErrors(response.startDate === moment(this.startDate?.value).format("D/M/YYYY") ? null : {valueNotMatch: true});
        this.endDate?.setErrors(response.endDate === moment(this.endDate?.value).format("D/M/YYYY") ? null : {valueNotMatch: true});
        this.jacsCode?.setErrors(response.jacsCode === this.jacsCode?.value ? null : {valueNotMatch: true});

        this.registerForm.updateValueAndValidity();
        console.log("Received Response registerForm",this.registerForm);

        this.successSubmission = this.registerForm.valid;
        this.errorSubmission = this.registerForm.invalid;
      });
    }
  }

  endDateValidator(startDate: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }
      const startDateControl = control.parent?.get(startDate)?.value ? moment(control.parent.get(startDate)?.value) : null;
      const endDateControl = control.value ? moment(control.value) : null;

      console.log(control, startDateControl, endDateControl);

      return startDateControl && endDateControl && startDateControl.isAfter(endDateControl) ? {endDateLimit: true} : null;
    };
  }

}
