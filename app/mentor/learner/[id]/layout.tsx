import { PropsWithChildren } from "react";
import Header from "../../../_common/navbar";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import LearnerPicker from "../../_components/learner-picker";
import { Id } from "@/convex/_generated/dataModel";
import Navigation from "@/app/_common/navigation";
import { SignOutButton } from "../../_components/signout-button";

export default async function Layout({
  children,
  params,
}: PropsWithChildren<{
  params: Promise<{ passphrase: string; id: Id<"learners"> }>;
}>) {
  const { id } = await params;
  const preloadedLearners = await preloadQuery(
    api.learners.list,
    {},
    {
      token: await convexAuthNextjsToken(),
    }
  );

  return (
    <>
      <Header>
        <LearnerPicker
          preloadedLearners={preloadedLearners}
          selectedLearnerId={id}
        />
        <div className="mx-auto">
          <Navigation basePath={`/mentor/learner/${id}`} />
        </div>
        <SignOutButton />
      </Header>
      {children}
    </>
  );
}
