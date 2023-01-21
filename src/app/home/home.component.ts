import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import * as moment from "moment";
import {PdfService} from "../service/pdf.service";
import {Register} from "../model/register";
import * as PDFJS from "pdfjs-dist";
import {TextItem} from "pdfjs-dist/types/src/display/api";

PDFJS.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.2.146/build/pdf.worker.min.js";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  submitted = false;
  pdfRegForm: Register;

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
      jacsCode: ['', [Validators.required]],
      file: [null, []],
      fileSource: ['', [Validators.required]]
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

  get file() {
    return this.registerForm?.get("file");
  }

  get fileSource() {
    return this.registerForm?.get("fileSource");
  }

  onSubmit() {
    this.submitted = true;
    if (this.registerForm?.valid && this.pdfRegForm) {

      this.course?.setErrors(this.pdfRegForm.course === this.course?.value ? null : {valueNotMatch: true});
      this.startDate?.setErrors(this.pdfRegForm.startDate === moment(this.startDate?.value).format("D/M/YYYY") ? null : {valueNotMatch: true});
      this.endDate?.setErrors(this.pdfRegForm.endDate === moment(this.endDate?.value).format("D/M/YYYY") ? null : {valueNotMatch: true});
      this.jacsCode?.setErrors(this.pdfRegForm.jacsCode === this.jacsCode?.value ? null : {valueNotMatch: true});

      this.registerForm.updateValueAndValidity();
      console.log("Received Response registerForm", this.registerForm);

      this.successSubmission = this.registerForm.valid;
      this.errorSubmission = this.registerForm.invalid;

    }
  }

  endDateValidator(startDate
                     :
                     string
  ):
    ValidatorFn {
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

  onFileChange(event
                 :
                 any
  ) {
    if (event.target.files.length > 0) {
      const file: File = event.target.files[0];
      const fileArray = file.arrayBuffer().then((value => {
        PDFJS.getDocument(value).promise
          .then((pdfDocument) => {
            const numPages = pdfDocument.numPages;
            pdfDocument.getPage(numPages - 1).then(pageContent => {
              pageContent.getTextContent().then((contents) => {
                const temp = contents.items.map(content => (content as TextItem).str)
                  .filter(value1 => value1.trim() != "");
                const jacsCodeLine: string | undefined = temp.at(temp.indexOf("Course name") + 6)?.match(new RegExp("JACS CODE ((.*))"))?.at(1);
                this.pdfRegForm = {
                  endDate: temp.at(temp.indexOf("Course name") + 5),
                  jacsCode: jacsCodeLine?.substring(jacsCodeLine.indexOf("(") + 1, jacsCodeLine?.lastIndexOf(")")),
                  startDate: temp.at(temp.indexOf("Course name") + 4),
                  course: temp.at(temp.indexOf("Course name") + 3)
                };
                console.log(this.pdfRegForm);
              });
            })
          })
      }));


      this.registerForm.patchValue({
        fileSource: file
      });
    }
  }

}
