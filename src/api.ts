import Env from "./env";
import type { AppointmentInfo, AppointmentInfoRequest, AppointmentRequest } from "./schemas";

type Method = "GET" | "POST" | "PUT" | "DELETE";

export default class API {
  private env: Env;

  public constructor() {
    this.env = new Env();
  }

  public async startScheduling(): Promise<void> {
    await this.fetchRequest("/api/Scheduling/Start", "POST", {});
  }

  public async stopScheduling(): Promise<AppointmentInfo[]> {
    return await this.fetchRequest("/api/Scheduling/Stop", "POST", {});
  }

  public async getSchedule(): Promise<AppointmentInfo[]> {
    return await this.fetchRequest("/api/Scheduling/Schedule", "GET");
  }

  public async getAppointmentRequest(): Promise<AppointmentRequest> {
    return await this.fetchRequest("/api/Scheduling/AppointmentRequest", "GET");
  }

  public async scheduleAppointment(appointment: AppointmentInfoRequest): Promise<void> {
    await this.fetchRequest("/api/Scheduling/Schedule", "POST", {
      doctorId: appointment.doctorId,
      personId: appointment.personId,
      appointmentTime: appointment.appointmentTime,
      isNewPatientAppointment: appointment.isNewPatientAppointment,
      requestId: appointment.requestId,
    });
  }

  private async fetchRequest(path: string, method: Method, body?: any): Promise<any> {
    const apiURL = this.env.getEnvVar("API_BASE_URL");
    const apiToken = this.env.getEnvVar("API_AUTH_TOKEN");
    const fullPath = `${apiURL}${path}?token=${apiToken}`;
    const requestBody = method === "GET" ? null : JSON.stringify(body);
    console.log(`Sending a request to ${path}`);
    try {
      const response = await fetch(fullPath, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: requestBody
      });
      const responseJSON = await response.json();
      if (response.ok) {
        return responseJSON;
      }
      else {
        console.warn(`Received status ${response.status} for ${path}: ${responseJSON}`);
        return null;
      }
    } catch (e) {
      console.error(`fetchRequest for ${path} failed: ${e}`);
    }
  }
}