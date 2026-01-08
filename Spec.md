# STG Game - 開發規格與版本進程

## 版本編號規則
- `v0.X.0` = 主要功能里程碑
- `v0.X.Ya` = 功能迭代 (a = alpha)
- `v0.X.Yb` = 修復/優化 (b = beta)
- `v1.0.0` = 正式發布版本

---

## v0.0.0 - 專案環境建置

### 必要項目
- [ ] Node.js 環境
- [ ] Vite 專案初始化
- [ ] TypeScript 設定
- [ ] Phaser 3 安裝
- [ ] 專案目錄結構
- [ ] Git 初始化
- [ ] GitHub Pages 部署設定
- [ ] PWA 基礎設定

---

### 步驟 1：建立專案

```bash
# 建立 Vite + TypeScript 專案
npm create vite@latest stg-game -- --template vanilla-ts
cd stg-game
npm install

# 安裝 Phaser
npm install phaser

# 安裝部署工具
npm install -D gh-pages
```

---

### 步驟 2：專案目錄結構

```
stg-game/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 部署設定
├── public/
│   ├── audio/                # 音效檔案
│   ├── images/               # 圖片資源
│   ├── sprites/              # 角色圖片
│   ├── effects/              # 特效圖片
│   ├── icons/                # PWA 圖示
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service Worker (建置時生成)
├── src/
│   ├── scenes/               # Phaser 場景
│   ├── systems/              # 遊戲系統
│   ├── utils/                # 工具函數
│   ├── config/               # 設定檔
│   ├── data/                 # 資料檔
│   └── main.ts               # 進入點
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── generate-sw.js            # SW 生成腳本
```

---

### 步驟 3：package.json 設定

```json
{
  "name": "stg-game",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && node generate-sw.js",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.3.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  },
  "dependencies": {
    "phaser": "^3.80.0"
  }
}
```

---

### 步驟 4：vite.config.ts 設定

```typescript
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';

// 讀取 package.json 版本號
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  base: '/stg-game/',  // GitHub Pages 路徑（改成你的 repo 名稱）
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  build: {
    assetsInlineLimit: 0
  }
});
```

---

### 步驟 5：GitHub Actions 部署設定

建立 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**GitHub 設定：**
1. 進入 Repository → Settings → Pages
2. Source 選擇 "GitHub Actions"

---

### 步驟 6：PWA manifest.json

建立 `public/manifest.json`：

```json
{
  "name": "STG Game",
  "short_name": "StgGame",
  "description": "A Phaser web game",
  "start_url": "./",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#111111",
  "theme_color": "#111111",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

### 步驟 7：Service Worker 生成腳本

建立 `generate-sw.js`：

```javascript
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// 讀取版本號
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const VERSION = pkg.version;

// 遞迴取得所有檔案
function getAllFiles(dir, baseDir = dir) {
  let files = [];
  for (const file of readdirSync(dir)) {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      files = files.concat(getAllFiles(filePath, baseDir));
    } else {
      const relativePath = filePath.replace(baseDir, '').replace(/\\/g, '/');
      files.push('.' + relativePath);
    }
  }
  return files;
}

// 取得 dist 資料夾所有檔案
const distFiles = getAllFiles('./dist');

// 生成 Service Worker
const swContent = `
const CACHE_NAME = 'stg-game-v${VERSION}';
const ASSETS = ${JSON.stringify(distFiles, null, 2)};

// 安裝時快取所有資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 啟用時清除舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('stg-game-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 攔截請求，優先使用快取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
`;

writeFileSync('./dist/sw.js', swContent.trim());
console.log(\`[SW] Generated sw.js with version \${VERSION}\`);
```

---

### 步驟 8：index.html PWA 設定

在 `<head>` 加入：

```html
<!-- PWA -->
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#111111">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="icons/icon-192.png">
```

在 `<body>` 結尾加入：

```html
<script>
  // 註冊 Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SW registered'))
        .catch(err => console.log('SW registration failed:', err));
    });
  }
</script>
```

---

### 步驟 9：PWA 圖示

準備兩個圖示放入 `public/icons/`：
- `icon-192.png` (192x192 px)
- `icon-512.png` (512x512 px)

建議使用正方形、簡潔的設計，支援 maskable 格式。

---

### 步驟 10：驗證部署

```bash
# 本地測試
npm run build
npm run preview

# 部署到 GitHub Pages
git add .
git commit -m "v0.0.0 - 專案環境建置"
git push origin main

# 等待 GitHub Actions 完成後訪問：
# https://[username].github.io/[repo-name]/
```

---

### v0.0.0 完成檢查清單

- [ ] `npm run dev` 可正常啟動
- [ ] `npm run build` 建置成功
- [ ] `dist/sw.js` 自動生成
- [ ] GitHub Actions 部署成功
- [ ] PWA 可安裝到桌面/手機
- [ ] 離線模式可正常運作

---

## v0.1.0 - 基礎遊戲框架

### 必要項目
- [ ] Phaser Game 設定檔
- [ ] 場景管理架構 (Scene)
- [ ] 響應式畫布 (RWD)
- [ ] 基礎遊戲迴圈
- [ ] 輸入系統 (滑鼠/觸控/鍵盤)
- [ ] 資源載入器 (Preloader)

---

## v0.2.0 - 視差背景系統

### 必要項目
- [ ] 背景容器 (最底)
- [ ] 背景圖層分層 (中/遠景)
- [ ] 無盡橫向背景捲動

---

## v0.3.0 - 角色系統

### 必要項目
- [ ] 角色容器 (比背景高)
- [ ] 角色 Sprite 載入
- [ ] 角色狀態機 (idle(fly)/attack/hurt)
- [ ] 角色移動控制 (畫面框內移動限制)
- [ ] 角色動畫系統

---

## v0.4.0 - 怪物系統

### 必要項目
- [ ] MonsterSystem 類別
- [ ] 怪物定義檔 (JSON)
- [ ] 怪物生成機制
- [ ] 怪物 AI (追蹤玩家)
- [ ] 怪物碰撞檢測
- [ ] 怪物血量/死亡
- [ ] 經驗值系統

---

## v0.5.0 - 彈幕&技能系統

### 必要項目
- [ ] SkillSystem 類別
- [ ] 技能定義檔
- [ ] 技能冷卻機制
- [ ] 技能傷害計算
- [ ] 技能視覺特效
- [ ] 技能欄 UI

---

## v0.6.0 - 技能與狀態效果

### 必要項目
- [ ] SkillExecutor 類別
- [ ] 技能升級系統

---

## v0.7.0 - UI 系統

### 必要項目
- [ ] HP/護盾/經驗條
- [ ] 等級顯示
- [ ] 技能欄圖示
- [ ] 彈出視窗系統
- [ ] 設定面板
- [ ] 死亡結算畫面

---

## v0.8.0 - 音效系統

### 必要項目
- [ ] SoundManager 類別
- [ ] BGM 管理 (播放/淡入淡出)
- [ ] UI 音效
- [ ] 打擊音效 (normal/crit/skill)
- [ ] 防爆音機制 (minInterval)
- [ ] 音量控制

---

## v0.9.0 - 難度與遊戲模式

### 必要項目
- [ ] 物件池 (Object Pool)
- [ ] 視野外剔除
- [ ] RenderTexture 優化
- [ ] iOS WebGL 相容性
- [ ] 記憶體管理

---

## v1.0.0 - 正式發布

### 必要項目
- [ ] 完整功能測試
- [ ] 跨平台測試 (PC/Android/iOS)
- [ ] 效能基準測試
- [ ] Bug 修復
- [ ] 文件完善

---

## 附錄：核心檔案清單

### 場景 (Scenes)
| 檔案 | 說明 |
|------|------|
| `StartScene.ts` | 開場資源預載 |
| `MainScene.ts` | 主遊戲邏輯 |

### 系統 (Systems)
| 檔案 | 說明 |
|------|------|
| `MonsterSystem.ts` | 怪物管理 |
| `SkillSystem.ts` | 技能定義與管理 |
| `SkillExecutor.ts` | 技能執行邏輯 |
| `SoundManager.ts` | 音效管理 |

---

## 附錄：技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Phaser 3 |
| 語言 | TypeScript |
| 建置 | Vite |
| 樣式 | CSS (原生) |
| 音效 | Web Audio API |
| 部署 | GitHub Pages |
