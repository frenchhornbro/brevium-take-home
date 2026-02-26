export type Doctor = 1 | 2 | 3;

export interface AppointmentInfo {
  doctorId: Doctor;
  personId: number;
  appointmentTime: string;
  isNewPatientAppointment: boolean;
}

export interface AppointmentRequest {
  requestId: number;
  personId: number;
  preferredDays: string[] | null;
  preferredDocs: Doctor[] | null;
  isNew: boolean;
}

export interface AppointmentInfoRequest extends AppointmentInfo {
  requestId: number;
}