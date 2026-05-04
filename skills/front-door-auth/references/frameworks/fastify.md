# Fastify

```js
import Fastify from 'fastify'

const fastify = Fastify()

const EMAIL_HEADER = 'x-forwarded-user-email'
const NAME_HEADER = 'x-forwarded-user-name'

async function requireAuth(req, reply) {
  const email = req.headers[EMAIL_HEADER]
  if (!email) return reply.code(401).send({ error: 'Unauthorized' })
  req.identity = {
    email,
    name: req.headers[NAME_HEADER] ?? email.split('@')[0],
  }
}

fastify.get('/', async () => 'Public')
fastify.get('/me', { preHandler: requireAuth }, async (req) => req.identity)
fastify.get('/private', { preHandler: requireAuth }, async (req) => {
  return `Hello, ${req.identity.name}`
})

fastify.listen({ port: 3000 })
```

Use `preHandler` (not `preValidation` or `onRequest`) so the identity is available when the handler runs. For TypeScript, decorate the request via `fastify.decorateRequest('identity', null)`.
