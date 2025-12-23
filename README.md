# WebFinal｜Open Book 台大考古題分享平台
Group 29 賴亮昕、顏佐霏、劉軒齊

## 重要連結

Demo 影片連結: https://drive.google.com/file/d/1K9bqQeiYGJRZ3PLKMyTTAGX8e27XlART/view?usp=drivesdk

Deployment link: https://web-final-lemon.vercel.app/

Monitor link: https://web-final-lemon.vercel.app/monitor

Github link: https://github.com/LiangSin/WebFinal

## 使用說明

我們做這個網站，是因為每學期、每年大家都在用各種群組、雲端連結分散地收集考古題，不但很麻煩，也常常找不到、連結失效或版本混亂。希望做一個只給台大學生使用、集中整理、好找又好分享的平台，讓考古題的流通更有效率，也讓準備考試更有依據，**要卷大家一起卷**。

主要功能包含：
- 依課程或教授名篩選考古題
- 上傳分享考古題，讓每位使用者貢獻考古題資源
- 透過資料夾收藏題目，方便複習

使用與操作方式：
1. 使用 @g.ntu.edu.tw 的 Google 帳號登入
2. 在 Trending⚡️ 頁面瀏覽熱門和最新上傳的考古題，或是使用搜尋功能尋找你想要的考古題
3. 你可以自由收藏和分類考古題，當然也可以檢舉有問題的考古題，會由管理員進行處理
4. 進入上傳頁，填寫課程/教授/年份/類別/是否含解答等欄位，並上傳檔案


## 開發

技術與框架：

- Framework：Next.js（App Router / Route Handlers / Server Actions）
- Language：TypeScript
- UI：React、Tailwind CSS（含 `lucide-react` icon）
- Auth：NextAuth v4（Google OAuth；限制 `@g.ntu.edu.tw`）
- Database：MongoDB + Mongoose
- File Storage：Google Drive API（`googleapis`，以管理員 OAuth refresh token 上傳）
- Deploy：Vercel
- Lint：ESLint

### localhost 安裝與測試之詳細步驟

1. **安裝套件**
    
    ```bash
    npm install
    ```
    
2.  複製 `.env.example` 一份到 `.env.local` ，並填上對應的 keys。
    - Google drive 相關的環境變數請參考 `docs/drive.md` 步驟設定
    - monitor 相關環境變數可自訂，於後續登入時使用。

3. **啟動開發伺服器**開啟 [http://localhost:3000](http://localhost:3000/)。
    
    ```bash
    npm run dev
    ```

4. **測試**
    - **測試流程（前台）**
        - 以 `@g.ntu.edu.tw` 帳號登入。
        - 瀏覽首頁 Trending、點擊考古題詳頁，嘗試閃電/收藏。
        - 前往「搜尋」頁套用關鍵字、年份與篩選條件，檢查排序。
        - 在「上傳」頁上傳題目/解答檔案，送出後檢查 Drive 有檔、DB 有新考古題，並在「我的頁面」確認「我的上傳」與「私人資料夾」。
    - **測試流程（管理端）**
        - 進入 `/monitor`，使用環境變數中設定的管理員帳密登入。
        - 檢視「檢舉」與「近期上傳」，嘗試編輯欄位、替換/新增/刪除檔案，確認頁面即時更新。
