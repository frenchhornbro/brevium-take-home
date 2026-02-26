import API from "./api";
import type { AppointmentInfo, AppointmentInfoRequest, AppointmentRequest, Doctor } from "./schemas";

type Slot = {
  time: string;
  doc: Doctor;
};

export default class Scheduler {
  private api: API;
  private schedule: Record<string, Partial<Record<Doctor, AppointmentInfo>>>;

  public constructor() {
    this.api = new API();
    this.schedule = {};
  }

  public async run() {
    console.log("Scheduler is running...");
    await this.api.startScheduling();
    await this.setInitialSchedule();
    while (true) {
      const appointmentRequest = await this.getAppointmentRequest();
      console.log(`Appointment request = ${JSON.stringify(appointmentRequest)}`);
      if (!appointmentRequest) {
        console.log("No more appointment requests");
        break;
      }
      let appointment;
      try {
        appointment = this.getAvailableSlot(appointmentRequest);
      } catch (e) {
        console.log(`Scheduling error (request id: ${appointmentRequest.requestId}): ${e}`);
        continue;
      }
      await this.scheduleAppointment(appointment);
    }
    this.stop();
  }

  private async stop() {
    const finalSchedule = await this.api.stopScheduling();
    console.log(`Final schedule = ${JSON.stringify(finalSchedule)}`);
  }

  private async setInitialSchedule(): Promise<void> {
    const schedule = await this.api.getSchedule();
    for (const s of schedule) {
      this.updateSchedule(s);
    }
  }

  private async getAppointmentRequest(): Promise<AppointmentRequest> {
    console.log("Getting appointment request...");
    return await this.api.getAppointmentRequest();
  }

  private async scheduleAppointment(appointment: AppointmentInfoRequest): Promise<void> {
    console.log(`Scheduling appointment (id: ${appointment.requestId})...`);
    this.updateSchedule(appointment);
    await this.api.scheduleAppointment(appointment);
  }

  private updateSchedule(appointment: AppointmentInfo): void {
    const dateString = this.getTimeKey(appointment.appointmentTime);
    const doctor = appointment.doctorId;
    if (!this.schedule[dateString]) {
      this.schedule[dateString] = {
        [doctor]: appointment
      };
    }
    else {
      this.schedule[dateString][doctor] = appointment;
    }
  }

  private getAvailableSlot(appointmentRequest: AppointmentRequest): AppointmentInfoRequest {
    // Determine preferred days and doctors
    const preferred: Slot[] = [];
    if (appointmentRequest.preferredDays?.length && appointmentRequest.preferredDocs?.length) {
      for (let i = 0; i < appointmentRequest.preferredDays.length; i++) {
        for (let j = 0; j < appointmentRequest.preferredDocs.length; j++) {
          preferred.push({
            time: appointmentRequest.preferredDays[i]!,
            doc: appointmentRequest.preferredDocs[j]!
          });
        }
      }
    }

    for (const slot of preferred) {
      if (this.appointmentIsValid(slot, appointmentRequest) && this.appointmentIsAvailable(slot)) {
        return {
          doctorId: slot.doc,
          personId: appointmentRequest.personId,
          appointmentTime: slot.time,
          isNewPatientAppointment: appointmentRequest.isNew,
          requestId: appointmentRequest.requestId
        };
      }
    }
    throw new Error("Algorithm: REQUESTED APPOINTMENT UNAVAILABLE"); //TODO: Find the next available valid slot
  }

  private appointmentIsValid(slot: Slot, appointmentRequest: AppointmentRequest): boolean {
    const time = new Date(slot.time); // TODO: Verify the time zone is UTC
    if (time.getDay() === 0 || time.getDay() === 6) { // Ensure it's a weekday
      return false;
    }
    if (time.getFullYear() !== 2021 || (time.getMonth() != 10 && time.getMonth() != 11)) { // Ensure it's in the correct range
      return false;
    }
    if (time.getHours() < 8 || time.getHours() > 16) { // Ensure it's within working hours
      return false;
    }
    if (time.getMinutes() != 0) { // Ensure it's scheduled on the hour
      return false;
    }
    if (appointmentRequest.isNew && (time.getHours() < 15 || time.getHours() > 16)) { // Ensure new patients are at 3/4pm
      return false;
    }
    return true; //TODO: Check if appointments are separated by a week for the patient
  }

  private appointmentIsAvailable(slot: Slot): boolean {
    const date = slot.time;
    const doc = slot.doc;
    if (date && doc && !this.schedule[this.getTimeKey(date)]?.[doc]) {
      return true;
    }
    // TODO: Handle when doctor / day are not specified
    // Get next available valid slot
    return false;
  }

  private getTimeKey(time: string): string {
    const date = new Date(time);
    return `${date.getDay}-${date.getMonth}-${date.getFullYear}:${date.getHours}`
  }
}