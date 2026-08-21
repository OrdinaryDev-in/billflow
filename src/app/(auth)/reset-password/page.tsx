import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Set a new password" };

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Set a new password</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Choose a new password for your account.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
