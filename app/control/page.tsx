import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "../admin-auth";
import ControlPanel from "./ControlPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ANTRIKSH Control",
  description: "Secure operations, client websites, subscriptions, leads and content management for ANTRIKSH.",
  robots: { index: false, follow: false },
};

async function ProtectedControl() {
  const user = await getAdminUser();
  if (!user) redirect("/admin-login?return_to=%2Fcontrol");
  return <ControlPanel initialUser={{ displayName: user.displayName, email: user.email }} />;
}

export default function ControlPage() {
  return <ProtectedControl />;
}
