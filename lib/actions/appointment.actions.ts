"use server";

import { ID, Query } from "node-appwrite";
import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { Appointment } from "@/types/appwrite.types";
import { formatDateTime, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
declare interface CreateUserParams {
  name: string;
  email: string;
  phone: string;
}
declare type UpdateAppointmentParams = {
  appointmentId: string;
  userId: string;
  appointment: Appointment;
  type: string;
};
declare type Gender = "male" | "female" | "other";
declare interface RegisterUserParams extends CreateUserParams {
  userId: string;
  birthDate: Date;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  privacyConsent: boolean;
}
declare type Status = "pending" | "scheduled" | "cancelled";
declare type CreateAppointmentParams = {
  userId: string;
  patient: string;
  primaryPhysician: string;
  reason: string;
  schedule: Date;
  status: Status;
  note: string | undefined;
};

export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );
    console.log(newAppointment);
    revalidatePath("/admin");
    return JSON.parse(JSON.stringify(newAppointment));
  } catch (error) {}
};

export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return JSON.parse(JSON.stringify(appointment));
  } catch (error) {
    console.log(error);
  }
};
export const getRecentAppointmentsList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );
    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };
    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointments) => {
        if (appointments.status === "scheduled") {
          acc.scheduledCount += 1;
        } else if (appointments.status === "pending") {
          acc.pendingCount += 1;
        } else if (appointments.status === "cancelled") {
          acc.cancelledCount += 1;
        }
        return acc;
      },
      initialCounts
    );
    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };
    console.log(appointments.total);

    return JSON.parse(JSON.stringify(data));
  } catch (error) {}
};

export const updateAppointment = async ({
  appointmentId,
  userId,
  appointment,
  type,
}: {
  appointmentId: string;
  userId: string;
  appointment: {
    primaryPhysician: string;
    schedule: Date;
    status: Status;
    cancellationReason: string | undefined;
  };
  type: "schedule" | "create" | "cancel";
}) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );
    if (!updatedAppointment) {
      throw new Error("Appointment not found");
    }
    const smsMessage = `Hi it is Carepulse. ${
      type === "schedule"
        ? `Your appointment has been scheduled for ${
            formatDateTime(appointment.schedule!).dateTime
          } with Dr. ${appointment.primaryPhysician}`
        : `We regret to inform you that your appointment has been cancelled. Reason: ${appointment.cancellationReason}`
    }`;
    await sendSMSNotification(userId, smsMessage);

    revalidatePath("/admin");
    return JSON.parse(JSON.stringify(updatedAppointment));
  } catch (error) {
    console.log(error);
  }
};
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
  } catch (error) {
    console.log(error);
  }
};
