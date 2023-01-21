import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Register} from "../model/register";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private http: HttpClient) {
  }

  getValuesFromPdf(): Observable<Register> {
    console.log("Sending request to backend to validate user input")
    return this.http.get<Register>("http://localhost:8080/valuesFromPdf");
  }

}
