import API from "./api";

export default class Server {
  private api;

  public constructor() {
    this.api = new API();
  }

  public async run() {
    console.log("Server is running...");
    await this.api.startScheduling();
    // TODO
    this.stop();
  }

  private async stop() {
    console.log("Shutting down server...");
    const finalSchedule = await this.api.stopScheduling();
    console.log(`Final schedule = ${JSON.stringify(finalSchedule)}`);
  }

  public async getAppointmentRequest() {
    console.log("Getting appointment request...");
    // TODO
  }
}