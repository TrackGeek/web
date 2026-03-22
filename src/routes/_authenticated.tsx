import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    try {
      const session = await context.auth.getSession();
      
      if (!session?.data?.session) {
        throw redirect({ to: "/" });
      }
  
      return { session };
    } catch (error) {
      console.error(error);
      
      throw redirect({ to: "/" });
    }
  },
  component: () => <Outlet />,
});
