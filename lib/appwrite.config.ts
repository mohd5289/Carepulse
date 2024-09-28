// "use server";
import * as sdk from "node-appwrite";
export const {
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  DOCTOR_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
  NEXT_PUBLIC_ID,
  NEXT_PUBLIC_ENDPOINT: ENDPOINT,
  NEXT_PUBLIC_BUCKET_ID: BUCKET_ID,
} = process.env;
const client = new sdk.Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
  .setProject(process.env.PROJECT_ID!)
  .setKey(process.env.API_KEY!);

export const databases = new sdk.Databases(client);
export const storage = new sdk.Storage(client);
export const users = new sdk.Users(client);
export const messaging = new sdk.Messaging(client);
