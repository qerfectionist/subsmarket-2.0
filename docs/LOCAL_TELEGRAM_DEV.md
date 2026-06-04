# Local Telegram Mini App development

Use this flow to test the Mini App inside Telegram without deploying every small change.

Current stable dev URL:

```text
https://dev.subsmarket.xyz
```

## 1. Start backend

```powershell
cd "C:\Users\qerfe\Documents\subsmarket 2.0\backend"
$env:DEBUG="true"
$env:APP_BASE_URL="https://dev.subsmarket.xyz"
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

`APP_BASE_URL` must be the public HTTPS tunnel URL that points to the frontend.
Notification buttons use this value for Mini App links.

## 2. Start frontend

```powershell
cd "C:\Users\qerfe\Documents\subsmarket 2.0\frontend"
npm run dev -- --host 0.0.0.0 --port 5173
```

The frontend calls `/api/v1`; Vite proxies `/api` and `/health` to `http://localhost:8000`.
This is required because Telegram on a phone cannot call your PC's `localhost`.

## 3. Start HTTPS tunnel

Use the named Cloudflare tunnel to `http://localhost:5173`.

```powershell
cloudflared tunnel run subsmarket-dev
```

The tunnel is configured in:

```text
C:\Users\qerfe\.cloudflared\config.yml
```

It routes:

```text
dev.subsmarket.xyz -> http://localhost:5173
```

Use `https://dev.subsmarket.xyz` as:

- Telegram Mini App URL in BotFather or bot menu setup.
- `APP_BASE_URL` for the backend.

## 4. Test flow

1. Open the bot in Telegram.
2. Launch the Mini App from the menu.
3. Send a join request from a second account.
4. Host opens requests, taps "Написать в Telegram", then approves or rejects.
