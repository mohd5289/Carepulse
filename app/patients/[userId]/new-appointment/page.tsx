"use client";
import AppointmentForm from "@/components/forms/AppointmentForm";
import PatientForm from "@/components/forms/PatientForm";
import { Button } from "@/components/ui/button";
import { getPatient } from "@/lib/actions/patient.actions";
import Image from "next/image";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { useState } from "react";
declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};
export default async function NewAppointment({
  params: { userId },
}: SearchParamProps) {
  const [isOpen, setIsOpen] = useState(false);
  const patient = await getPatient(userId);
  Sentry.metrics.set("user_view_new_appointment", patient.name);
  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-1 justify-between">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="patient"
            className="mb-12 h-10 w-fit"
          />
          {/* <PatientForm /> */}
          <AppointmentForm
            type="create"
            userId={userId}
            patientId={patient?.$id}
            // setOpen={setIsOpen}
          />

          <p className="copyright mt-10 py-12"> © 2024 CarePulse</p>
          {/* <Link href="/?admin=true" className="text-green-500">
              Admin
            </Link> */}
        </div>
      </section>
      <Image
        src="/assets/images/appointment-img.png"
        height={1000}
        width={1000}
        alt="appointment"
        className="side-img max-w-[390px] bg-bottom"
      />
    </div>
  );
}
