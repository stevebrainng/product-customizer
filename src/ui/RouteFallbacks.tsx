import { Link, type ErrorComponentProps } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="grid h-full place-items-center bg-[#f3f4f6] px-4 text-zinc-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-zinc-600">This address does not match a page.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white"
          >
            View product
          </Link>
          <Link
            to="/designer"
            className="inline-flex h-11 items-center rounded-lg border border-zinc-950 px-4 text-sm font-semibold"
          >
            Open designer
          </Link>
        </div>
      </div>
    </div>
  )
}

export function RouteError({ error, reset }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  return (
    <div className="grid h-full place-items-center bg-[#f3f4f6] px-4 text-zinc-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-zinc-600">{message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-lg border border-zinc-950 px-4 text-sm font-semibold"
          >
            Back to product
          </Link>
        </div>
      </div>
    </div>
  )
}
