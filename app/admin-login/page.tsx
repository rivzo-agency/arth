import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "../admin-auth";
import LoginCard from "./LoginCard";
import "./login.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin login — ANTRIKSH Control",
  description: "Secure sign-in for the ANTRIKSH control centre.",
  robots: { index: false, follow: false },
};

function safeReturnTo(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/control";
  return value.startsWith("/control") ? value : "/control";
}

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.return_to);
  const user = await getAdminUser();
  if (user) redirect(returnTo);

  return <LoginCard returnTo={returnTo} />;
}
