type Doctor = 1 | 2 | 3;

export interface AppointmentInfo {
  doctorId: Doctor;
  personId: number;
  appointmentTime: Date;
  isNewPatientAppointment: boolean;
}

export interface AppointmentRequest {
  requestId: number;
  personId: number;
  preferredDays: Date | null;
  preferredDocs: Doctor | null;
  isNew: boolean;
}

export interface AppointmentInfoRequest {
  doctorId: Doctor;
  personId: number;
  appointmentTime: Date;
  isNewPatientAppointment: boolean;
  requestId: number;
}