"use client";

import { cloneElement, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Send } from "lucide-react";
import {
  contactSchema,
  type ContactInput,
} from "@/features/contact/contact.schema";
import type { ContactResponse } from "@/features/contact/contact.types";

export function ContactForm() {
  const startedAt = useRef(Date.now());
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      website: "",
      startedAt: startedAt.current,
    },
  });
  const submit = async (values: ContactInput) => {
    setResult(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await response.json()) as ContactResponse;
      if (!response.ok)
        throw new Error(body.message || "Unable to send your message.");
      setResult({ ok: true, message: body.message });
      reset({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: "",
        startedAt: Date.now(),
      });
      startedAt.current = Date.now();
    } catch (error) {
      setResult({
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to send your message.",
      });
    }
  };
  return (
    <form className="contact-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="field-row">
        <Field label="Name" error={errors.name?.message}>
          <input
            {...register("name")}
            autoComplete="name"
            aria-invalid={!!errors.name}
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
        </Field>
      </div>
      <Field label="Subject" error={errors.subject?.message}>
        <input {...register("subject")} aria-invalid={!!errors.subject} />
      </Field>
      <Field label="Message" error={errors.message?.message}>
        <textarea
          {...register("message")}
          rows={6}
          aria-invalid={!!errors.message}
        />
      </Field>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input {...register("website")} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input
        type="hidden"
        {...register("startedAt", { valueAsNumber: true })}
      />
      <button
        className="button primary submit"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? <LoaderCircle className="spin" /> : <Send />}{" "}
        {isSubmitting ? "Sending…" : "Send Message"}
      </button>
      {result && (
        <p
          className={`form-result ${result.ok ? "success" : "error"}`}
          role="status"
        >
          {result.message}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactElement;
}) {
  const id = label.toLowerCase();
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {/* IDs and descriptions are attached without cloning interactive behavior. */}
      <span className="control">{useFieldProps(children, id, error)}</span>
      {error && (
        <small id={`${id}-error`} role="alert">
          {error}
        </small>
      )}
    </label>
  );
}

function useFieldProps(
  element: React.ReactElement,
  id: string,
  error?: string,
) {
  return cloneElement(element, {
    id,
    "aria-describedby": error ? `${id}-error` : undefined,
  } as React.HTMLAttributes<HTMLElement>);
}
