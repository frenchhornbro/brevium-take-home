export interface AppointmentInfo {
  doctorId: 1 | 2 | 3;
  personId: number;
  appointmentTime: Date;
  isNewPatientAppointment: boolean;
}