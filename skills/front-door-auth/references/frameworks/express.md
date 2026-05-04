# Express

```js
import express from 'express'

const app = express()

const EMAIL_HEADER = 'x-forwarded-user-email'
const NAME_HEADER = 'x-forwarded-user-name'

function requireAuth(req, res, next) {
  const email = req.header(EMAIL_HEADER)
  if (!email) return res.status(401).json({ error: 'Unauthorized' })
  req.identity = {
    email,
    name: req.header(NAME_HEADER) ?? email.split('@')[0],
  }
  next()
}

app.get('/', (_, res) => res.send('Public'))
app.get('/me', requireAuth, (req, res) => res.json(req.identity))
app.get('/private', requireAuth, (req, res) => {
  res.send(`Hello, ${req.identity.name}`)
})

app.listen(3000)
```

Apply `requireAuth` only to the routes the user said are protected. For TypeScript, augment the `Request` type with `identity?: { email: string; name: string }`.
