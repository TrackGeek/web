import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/donate/error/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/donate/error/"!</div>
}
