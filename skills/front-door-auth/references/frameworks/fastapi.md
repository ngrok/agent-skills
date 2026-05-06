# FastAPI

```python
from fastapi import FastAPI, Depends, HTTPException, Request

app = FastAPI()


def require_auth(request: Request) -> dict:
    email = request.headers.get("x-forwarded-user-email")
    if not email:
        raise HTTPException(status_code=401, detail="Unauthorized")
    name = request.headers.get("x-forwarded-user-name") or email.split("@")[0]
    return {"email": email, "name": name}


@app.get("/")
def public():
    return "Public"


@app.get("/me")
def me(identity: dict = Depends(require_auth)):
    return identity


@app.get("/private")
def private(identity: dict = Depends(require_auth)):
    return f"Hello, {identity['name']}"
```

Apply `Depends(require_auth)` only on protected routes. For typed identity, define a `pydantic.BaseModel` and have `require_auth` return it.
