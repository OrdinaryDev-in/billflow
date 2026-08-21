import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Log in</h1>
        <p className="mt-1 text-sm text-text-secondary">Welcome back.</p>
      </div>
      <LoginForm oauthError={error} />
      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:text-primary-hover">
          Sign up
        </Link>
      </p>
    </div>
  );
}
