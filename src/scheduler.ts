import API from "./api";
import type { AppointmentInfo, AppointmentInfoRequest, AppointmentRequest } from "./schemas";

export default class Scheduler {
  private api: API;
  private schedule: AppointmentInfo[]; // QQQ: What data structure would be most efficient for the schedule?

  public constructor() {
    this.api = new API();
    this.schedule = [];
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
      // TODO: Scheduling algorithm
    }
    this.stop();
  }

  private async stop() {
    const finalSchedule = await this.api.stopScheduling();
    console.log(`Final schedule = ${JSON.stringify(finalSchedule)}`);
  }

  private async setInitialSchedule(): Promise<void> {
    this.schedule = await this.api.getSchedule();
  }

  private async getAppointmentRequest(): Promise<AppointmentRequest> {
    console.log("Getting appointment request...");
    return await this.api.getAppointmentRequest();
  }
  
  private async scheduleAppointment(appointment: AppointmentInfoRequest): Promise<void> {
    console.log(`Scheduling appointment (id: ${appointment.requestId})...`);
    this.schedule.push(appointment);
    await this.api.scheduleAppointment(appointment);
  }
}