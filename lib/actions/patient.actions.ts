"use server";
import { ID, Query } from "node-appwrite";

import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { InputFile } from "node-appwrite/file";
import { parseStringify } from "../utils";
// import axios from "axios";
declare interface User extends CreateUserParams {
  $id: string;
}
export const createUser = async (user: CreateUserParams) => {
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );
    console.log({ newUser });
    return JSON.parse(JSON.stringify(newUser));
  } catch (error: any) {
    if (error && error?.code === 409) {
      const documents = await users.list([Query.equal("email", [user.email])]);
      return documents?.users[0];
    }
  }
};
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return JSON.parse(JSON.stringify(user));
  } catch (error) {}
};
export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );
    return JSON.parse(JSON.stringify(patients.documents[0]));
  } catch (error) {}
};

export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    let file;
    if (identificationDocument) {
      const inputFile = InputFile.fromBuffer(
        identificationDocument?.get("blobFile") as Blob,
        identificationDocument?.get("fileName") as string
      );
      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
      // console.log(file);
      const newPatient = await databases.createDocument(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        ID.unique(),
        {
          identificationDocumentId: file?.$id ? file.$id : null,
          identificationDocumentUrl: file?.$id
            ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view??project=${PROJECT_ID}`
            : null,
          ...patient,
        }
      );
      console.log(newPatient);

      return JSON.parse(JSON.stringify(file));
    }
  } catch (error) {}
};
// const endpoint = 'https://your-appwrite-endpoint/v1/users';
// const projectId = 'your-project-id';
// const apiKey = 'your-api-key';

// const options = {
//     method: 'POST',
//     url: endpoint,
//     headers: {
//         'Content-Type': 'application/json',
//         'X-Appwrite-Project': process.env.PROJECT_ID!,
//         'X-Appwrite-Key': process.env.API_KEY!
//     },
//     data: data
// };
