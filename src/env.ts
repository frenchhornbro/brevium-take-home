import dotenv from "dotenv";

export default class Env {
  public constructor() {
    dotenv.config();
  }

  public getEnvVar(varName: string) {
    const envVar = process.env[varName];
    if (envVar === undefined) {
      console.warn(`${varName} is undefined`);
    }
    return envVar;
  }
}