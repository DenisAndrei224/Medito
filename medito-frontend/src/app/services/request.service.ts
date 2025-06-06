import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IncomingRequest } from '../models/incoming-request.model';

// Define the shape of the response from the incomingRequests API
export interface IncomingRequestsResponse {
  requests: any[]; // Or IncomingRequest[] if you move the interface here
}

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  sendRequest(receiverId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/requests/send`, {
      receiver_id: receiverId,
    });
  }

  getIncomingRequests(): Observable<IncomingRequestsResponse> {
    return this.http.get<IncomingRequestsResponse>(
      `${this.apiUrl}/requests/incoming`
    );
  }

  acceptRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/requests/accept`, {
      request_id: requestId,
    });
  }

  denyRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/requests/deny`, {
      request_id: requestId,
    });
  }
}
