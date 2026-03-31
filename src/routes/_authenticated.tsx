import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    // biome-ignore lint/suspicious/noImplicitAnyLet: the type of session is inferred from the auth client, which can be of any shape depending on the plugins used
    let session;
    try {
      session = await context.auth.getSession();
    } catch (error) {
      console.error(error);
      throw redirect({ to: "/", search: { landing: "true" } });
    }

    if (!session?.data?.session) {
      throw redirect({ to: "/", search: { landing: "true" } });
    }

    return { session };
  },
  component: () => <Outlet />,
});
