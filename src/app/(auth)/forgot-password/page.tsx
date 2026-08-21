import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Reset your password</h1>
        <p className="mt-1 text-sm text-text-secondary">
          We&apos;ll email you a link to set a new one.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-text-secondary">
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
