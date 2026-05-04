# Next.js (App Router)

Two pieces: middleware that gates protected routes, and `headers()` reads in server components or route handlers.

## Middleware

`middleware.ts` at the project root:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/me', '/private']

export function middleware(req: NextRequest) {
  if (!PROTECTED.some((p) => req.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next()
  }
  const email = req.headers.get('x-forwarded-user-email')
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.next()
}
```

## Reading identity in a server component

```ts
import { headers } from 'next/headers'

export default async function MePage() {
  const h = await headers()
  const email = h.get('x-forwarded-user-email')!
  const name = h.get('x-forwarded-user-name') ?? email.split('@')[0]
  return <div>Hello, {name}</div>
}
```

## Reading identity in a route handler

```ts
import { headers } from 'next/headers'

export async function GET() {
  const h = await headers()
  const email = h.get('x-forwarded-user-email')!
  const name = h.get('x-forwarded-user-name') ?? email.split('@')[0]
  return Response.json({ email, name })
}
```

The middleware enforces the boundary; the `headers()` reads attach identity to handlers. Don't read these headers from `Request.headers` in client components — they're not available there.
