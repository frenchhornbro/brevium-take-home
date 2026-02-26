import API from "./api";
import type { AppointmentInfo, AppointmentInfoRequest, AppointmentRequest, Doctor } from "./schemas";

type Slot = {
  day: string | undefined;
  doc: Doctor | undefined;
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
            day: appointmentRequest.preferredDays[i],
            doc: appointmentRequest.preferredDocs[j]
          });
        }
      }
    }

    for (const slot of preferred) {
      if (this.appointmentIsValid(appointmentRequest) && this.appointmentIsAvailable(slot)) {
        return {
          doctorId: 1, //TODO
          personId: appointmentRequest.personId,
          appointmentTime: slot.day || "undefined time", //TODO
          isNewPatientAppointment: appointmentRequest.isNew,
          requestId: appointmentRequest.requestId
        };
      }
    }
    throw new Error("Algorithm: REQUESTED APPOINTMENT UNAVAILABLE"); //TODO: Find a different, valid slot
  }

  private appointmentIsValid(appointmentRequest: AppointmentRequest): boolean {
    return true; //TODO
  }

  private appointmentIsAvailable(slot: Slot): boolean {
    const date = slot.day;
    const doc = slot.doc;
    if (date && doc && !this.schedule[this.getTimeKey(date)]?.[doc]) { // TODO: Handle when doctor / day are not specified
      return true;
    }
    return false;
  }

  private getTimeKey(time: string): string {
    const date = new Date(time);
    return `${date.getDay}-${date.getMonth}-${date.getFullYear}`
  }
}