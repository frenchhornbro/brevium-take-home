import Env from "./env";
import type { AppointmentInfo } from "./schemas";

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

  private async fetchRequest(path: string, method: Method, body: any): Promise<any> {
    const apiURL = this.env.getEnvVar("API_BASE_URL");
    const apiToken = this.env.getEnvVar("API_AUTH_TOKEN");
    const fullPath = `${apiURL}${path}?token=${apiToken}`;
    console.log(`Sending a request to ${path}`);
    try {
      const response = await fetch(fullPath, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const responseJSON = await response.json();
      if (response.ok) {
        return responseJSON;
      }
      else {
        return responseJSON;
      }
    } catch {
      console.warn(`fetchRequest for ${path} failed`);
    }
  }
}