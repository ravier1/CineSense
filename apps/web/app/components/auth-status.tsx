"use client";

import { useSearchParams } from "next/navigation";

const messages: Record<string, string> = {
  confirmation: "That confirmation link is missing or has expired. Create a new account request and check your email again.",
  configuration: "CineSense account services are not configured for this deployment yet.",
};

export function AuthStatus() {
  const searchParams = useSearchParams();
  const message = messages[searchParams.get("error") ?? ""];
  return message ? <p className="form-message" role="alert">{message}</p> : null;
}
