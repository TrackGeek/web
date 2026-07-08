import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    let session: any;

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
