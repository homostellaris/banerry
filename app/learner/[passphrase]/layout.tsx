import { PropsWithChildren } from "react";
import Navigation from "./navigation";

export default async function LearnerPassphraseLayout({ 
  children, 
  params 
}: PropsWithChildren<{
  params: Promise<{ passphrase: string }>;
}>) {
  const { passphrase } = await params;

  return (
    <>
      <Navigation passphrase={passphrase} />
      {children}
    </>
  );
}