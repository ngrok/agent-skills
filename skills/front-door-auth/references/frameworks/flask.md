# Flask

```python
from functools import wraps
from flask import Flask, request, jsonify, abort, g

app = Flask(__name__)


def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        email = request.headers.get("X-Forwarded-User-Email")
        if not email:
            abort(401)
        g.identity = {
            "email": email,
            "name": request.headers.get("X-Forwarded-User-Name") or email.split("@")[0],
        }
        return f(*args, **kwargs)
    return wrapper


@app.get("/")
def public():
    return "Public"


@app.get("/me")
@require_auth
def me():
    return jsonify(g.identity)


@app.get("/private")
@require_auth
def private():
    return f"Hello, {g.identity['name']}"
```

Apply `@require_auth` only to protected routes. The decorator stashes identity on `flask.g`, which is request-scoped.
