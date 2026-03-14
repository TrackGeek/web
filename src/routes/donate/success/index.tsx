import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/donate/success/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/donate/success/"!</div>
}
