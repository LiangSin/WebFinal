# Google Drive Service Account 設定指南

本專案使用 Google Drive API 進行考古題檔案的儲存。為了讓系統能夠自動上傳檔案，您需要設定一個 Google Cloud Service Account (服務帳號)。

以下是詳細的設定步驟：

## 步驟 1：建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)。
2. 點選左上角的專案選擇器，然後點選「**新增專案 (New Project)**」。
3. 輸入專案名稱（例如 `WebFinal-Drive-Upload`），然後點選「**建立 (Create)**」。

## 步驟 2：啟用 Google Drive API

1. 在左側選單中，點選「**API 和服務 (APIs & Services)**」 > 「**已啟用的 API 和服務 (Enabled APIs & services)**」。
2. 點選上方的「**+ 啟用 API 和服務 (+ ENABLE APIS AND SERVICES)**」。
3. 在搜尋框輸入 `Google Drive API`。
4. 點選搜尋結果中的 **Google Drive API**，然後按「**啟用 (Enable)**」。

## 步驟 3：建立 OAuth Client ID

1. 回到「**API 和服務**」選單，點選左側的「**憑證 (Credentials)**」。
2. 點選上方的「**+ 建立憑證 (+ CREATE CREDENTIALS)**」，選擇「**OAuth client ID**」。
3. Application type 選擇 **Desktop app**，自行設定名稱
4. 建立完成後，下載 JSON 格式的 client secret，檔案留著等一下要用
5. 從該 JSON 檔案中，可以得到**環境變數**：
   - client_id -> **`ADMIN_DRIVE_CLIENT_ID`**
   - client_secret -> **`ADMIN_DRIVE_CLIENT_SECRET`**

## 步驟 4：取得 Refresh Token

我們需要使用管理員的帳號進行 OAuth，負責檔案的上傳，因此要先產生該管理員帳號的登入 TOKEN

1. 利用前一步得到的 client secret 檔案，執行此資料夾中的工具程式：
   ```bash
   python get_refresh_token.py /path/to/your/client_secret.json
   ```
2. 按照指示登入帳號，注意這個帳號將會被用於所有使用者的檔案上傳，會被佔用雲端空間！
3. 程式將會印出格式為 "1//0..." 的字串，就是**環境變數 `ADMIN_DRIVE_REFRESH_TOKEN`**。

## 步驟 5：設定 Google Drive 資料夾權限

為了讓 Service Account 能上傳檔案到您的 Google Drive，您需要建立一個資料夾並授權給它。

1. 前往您的 [Google Drive](https://drive.google.com/)。
2. 建立一個新資料夾（例如 `WebFinal_Uploads`）。
3. 對該資料夾點選右鍵 >「**共用 (Share)**」。
4. 在「新增使用者或群組」欄位中，貼上**步驟 4 所登入的 Email**。
5. 權限選擇「**編輯者 (Editor)**」，然後點選「**傳送 (Send)**」。
6. **取得資料夾 ID**：
   - 進入該資料夾。
   - 觀察瀏覽器網址列，網址通常長這樣：
     `https://drive.google.com/drive/folders/1aBcD_EFgH-IjKlMnOpQrStUvWxYz1234`
   - 最後一串亂碼 `1aBcD_EFgH-IjKlMnOpQrStUvWxYz1234` 即為**環境變數 `GOOGLE_DRIVE_FOLDER_ID`**。

