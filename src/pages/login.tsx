import { Helmet } from 'react-helmet';

export function LoginPage() {
  return (
    <>
      <Helmet>
        <title>Track Verse | Login</title>
      </Helmet>
              
      <main className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-blue-600">Login Page</h1>
        <p className="text-sm text-blue-500">Please log in to continue.</p>
      </main>
    </>
  )
}