import { headers } from "next/headers";
import PropertyOS from "./property-os";

export const dynamic = "force-dynamic";

export default async function Home() {
  const requestHeaders = await headers();
  const userEmail = requestHeaders.get("oai-authenticated-user-email");
  return <PropertyOS userEmail={userEmail}/>;
}
