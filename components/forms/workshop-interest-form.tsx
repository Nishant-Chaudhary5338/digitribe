"use client";

import { useState } from "react";
import FormField from "@/components/forms/form-field";

type FormState = "idle" | "loading" | "success" | "error";

export default function WorkshopInterestForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setState("loading");
    setErrorMessage(undefined);

    try {
      const response = await fetch("/api/workshop-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setState("success");
    } catch {
      setState("error");
      setErrorMessage(
        "Something went wrong. Please try again or email us directly."
      );
    }
  }

  if (state === "success") {
    return (
      <div
        className="rounded-xl border border-[#ff5b3a] bg-[#1a1f3a] px-6 py-5"
        role="status"
        aria-live="polite"
      >
        <p className="text-[#f0ede5] font-medium">You're on the list.</p>
        <p className="text-[#c4c1b8] text-sm mt-1">
          We'll reach out when registration opens.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        label="Your email"
        htmlFor="workshop-email"
        required
        error={errorMessage}
      >
        <input
          id="workshop-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={state === "loading"}
          autoComplete="email"
          className="rounded-lg border border-[#2d3748] bg-[#1a1f3a] text-[#f0ede5] placeholder-[#c4c1b8] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5b3a] focus:border-transparent disabled:opacity-50 transition"
        />
      </FormField>

      <button
        type="submit"
        disabled={state === "loading"}
        className="btn-primary self-start font-medium text-sm px-6 py-3 disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2"
        style={{ background: 'var(--color-accent)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }}
      >
        {state === "loading" ? "Sending..." : "Notify me"}
      </button>
    </form>
  );
}
