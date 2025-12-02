# 資料庫架構說明 (MongoDB)

本專案使用 MongoDB 作為資料庫，並透過 Mongoose 進行操作。所有的資料庫相關程式碼都集中在 `src/lib/db` 目錄下，以保持架構清晰並方便維護。

## 檔案結構

- **`src/lib/db/connect.ts`**: 負責處理資料庫連線。
  - 包含 Global Cache 機制，防止在開發環境 (Hot Reload) 中產生過多連線。
  - 自動讀取 `MONGODB_URI` 環境變數。
- **`src/lib/db/models.ts`**: 定義資料模型 (Schema)。
  - 目前包含 `User` (使用者) 與 `Exam` (考古題) 模型。
- **`src/lib/db/operations.ts`**: 定義所有資料庫操作函式。
  - 封裝了 `find`, `create`, `save` 等 Mongoose 操作，讓前端或 API 只需呼叫語意化的函式。
- **`src/lib/db/index.ts`**: 統一匯出口，方便外部引用。

## 如何使用

在 Server Component、Server Action 或 API Route 中，您可以直接引用 `src/lib/db` 中的函式來存取資料庫。

### 1. 查詢資料 (Reading Data)

範例：在頁面中獲取熱門考古題。

```typescript
// src/app/page.tsx
import { getTrendingExams } from '@/lib/db/operations';

export default async function Home() {
  // Server Component 可以直接呼叫 DB 函式
  const trendingExams = await getTrendingExams();

  return (
    <ul>
      {trendingExams.map((exam) => (
        <li key={exam._id.toString()}>{exam.title}</li>
      ))}
    </ul>
  );
}
```

### 2. 寫入資料 (Writing Data)

範例：透過 Server Action 上傳考古題。

```typescript
// src/app/actions.ts
'use server';

import { createExam } from '@/lib/db/operations';

export async function uploadExam(data: FormData) {
  const title = data.get('title');
  // ... 處理其他欄位

  await createExam({
    title: title as string,
    courseName: '範例課程',
    uploadedBy: 'userId123', // 需從 Session 獲取
  });
}
```

## 如何擴充

### 新增資料類型 (Model)

若需新增功能（例如「收藏」），請在 `src/lib/db/models.ts` 定義新的 Schema：

```typescript
// src/lib/db/models.ts
const FavoriteSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  exam: { type: Schema.Types.ObjectId, ref: 'Exam' },
});

// 確保使用 models 檢查以支援 Hot Reload
export const Favorite = models.Favorite || model('Favorite', FavoriteSchema);
```

### 新增操作函式 (Operations)

接著在 `src/lib/db/operations.ts` 新增對應的函式：

```typescript
// src/lib/db/operations.ts
import { Favorite } from './models';

export async function addFavorite(userId: string, examId: string) {
  await ensureDbConnection();
  const fav = new Favorite({ user: userId, exam: examId });
  await fav.save();
  return fav.toObject();
}
```

## 環境變數

請確保 `.env.local` 中包含正確的連線字串：

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
```

