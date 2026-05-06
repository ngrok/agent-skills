# Hono

```ts
import { Hono } from 'hono'

type Identity = { email: string; name: string }

declare module 'hono' {
  interface ContextVariableMap {
    identity: Identity
  }
}

const app = new Hono()

const EMAIL_HEADER = 'x-forwarded-user-email'
const NAME_HEADER = 'x-forwarded-user-name'

function requireAuth() {
  return async (c: any, next: () => Promise<void>) => {
    const email = c.req.header(EMAIL_HEADER)
    if (!email) return c.json({ error: 'Unauthorized' }, 401)
    const name = c.req.header(NAME_HEADER) ?? email.split('@')[0]
    c.set('identity', { email, name })
    await next()
  }
}

app.get('/', (c) => c.text('Public'))
app.get('/me', requireAuth(), (c) => c.json(c.get('identity')))
app.get('/private', requireAuth(), (c) => {
  const { name } = c.get('identity')
  return c.text(`Hello, ${name}`)
})

export default { port: 3000, fetch: app.fetch }
```

Apply `requireAuth()` only to the routes the user said are protected. Leave public routes unmiddlewared.
