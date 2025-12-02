## Getting Started（本機開發）

1. **安裝套件**

```bash
npm install
```

2. **設定環境變數 `.env.local`**

在專案根目錄建立 `.env.local`：

```bash
GOOGLE_CLIENT_ID=你的GoogleClientID
GOOGLE_CLIENT_SECRET=你的GoogleClientSecret

AUTH_SECRET=隨機長字串_例如用 openssl rand -base64 32 產生
AUTH_TRUST_HOST=true
```

3. **啟動開發伺服器**

```bash
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000) 即可看到畫面。

右上角會顯示「使用 g.ntu.edu.tw 登入」按鈕：

- 點擊後會導向 Google OAuth，同意後回到網站。
- 只允許 `@g.ntu.edu.tw` 網域的帳號登入。

## Google OAuth 設定（Google Cloud Console）

1. **建立專案與 OAuth 同意畫面**
   - 到 Google Cloud Console，建立專案。
   - 在「API 和服務 → OAuth 同意畫面」設定 app 資訊。

2. **建立 OAuth 用戶端 ID（Web application）**
   - 在「憑證」頁面新增 OAuth client。

3. **設定 Authorized redirect URIs / origins**

開發環境（本機）：

- Authorized redirect URI：

  ```text
  http://localhost:3000/api/auth/callback/google
  ```

- Authorized JavaScript origin：

  ```text
  http://localhost:3000
  ```

正式環境（Vercel 上的 `https://web-final-lemon.vercel.app/`）：

- Authorized redirect URI：

  ```text
  https://web-final-lemon.vercel.app/api/auth/callback/google
  ```

- Authorized JavaScript origin：

  ```text
  https://web-final-lemon.vercel.app
  ```

建立完成後，將拿到的 **Client ID / Client Secret** 填入 `.env.local`。

## 本機測試登入流程

1. 啟動 `npm run dev`。
2. 打開 [http://localhost:3000](http://localhost:3000)。
3. 點右上角「使用 g.ntu.edu.tw 登入」：
   - 使用 `xxx@g.ntu.edu.tw` → 應該登入成功，右上角顯示 email 與「登出」。
   - 使用非 `@g.ntu.edu.tw` → 依照 `signIn` callback 設定會被拒絕。
4. 可以打開瀏覽器 DevTools → Network，確認 `GET /api/auth/session` 回傳包含 `user.email` 的 JSON。

## Deploy 到 Vercel

1. 在 Vercel 建立專案並連接這個 repo。
2. 在 Vercel 專案的「Environment Variables」加上：

   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AUTH_SECRET`
   - `AUTH_TRUST_HOST=true`

3. 重新 Deploy。

4. 到 [https://web-final-lemon.vercel.app/](https://web-final-lemon.vercel.app/)：
   - 右上角登入按鈕行為應與本機相同。
   - 若 Google OAuth 出錯，請再次確認 redirect URIs / origins 是否完全符合上述設定。

