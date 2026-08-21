# kr_travel 部署到 Vercel 或 Netlify 完整教學

本專案是純靜態的 Vite + React 單頁應用(PWA),沒有任何後端伺服器,非常適合部署到 Vercel 或 Netlify。兩個平台都提供免費方案,以下分別說明操作步驟。

## 部署前的必要條件

部署前請確認以下事項已完成:

| 項目 | 說明 |
| --- | --- |
| GitHub 倉庫 | 程式碼已推送到 https://github.com/m45801ch/kr_travel(已完成) |
| GitHub 帳號 | 部署時兩平台都會要求用 GitHub 帳號授權登入 |
| 平台帳號 | 免費註冊 Vercel(https://vercel.com)或 Netlify(https://netlify.com) |

## 重要提醒:PWA 與資料

1. **必須使用 HTTPS**:此專案是 PWA(Service Worker、離線快取、安裝到手機)只有在 HTTPS 網址下才能正常運作。Vercel 與 Netlify 自動提供 HTTPS 免費憑證,直接符合要求。
2. **資料存在 IndexedDB**:行程資料存在使用者裝置的瀏覽器裡,不會跨裝置同步。部署上線後,請提醒使用者(或自己)定期在「設置」頁面匯出 JSON 備份。
3. **VitePWA 的 SPA fallback**:兩平台部署時,建議加一個設定檔確保重新整理(reload)任意頁面(如 /itinerary)時不會出現 404,設定檔內容在下方說明。

## 方法一:部署到 Vercel(推薦,最簡單)

### 步驟 1:建立 Vercel 帳號並連結 GitHub

前往 https://vercel.com/signup,選擇「Continue with GitHub」授權登入。

### 步驟 2:匯入倉庫

登入後在 Dashboard 點擊「Add New... → Project」,選擇「Import Git Repository」,找到並選擇 **kr_travel** 倉庫,點擊 Import。

### 步驟 3:確認建置設定

Vercel 會自動偵測 Vite 專案,設定如下(通常會自動填好):

| 設定項 | 值 |
| --- | --- |
| Framework Preset | Vite |
| Build Command | `npm run build`(或留空,自動偵測) |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | 20 或 22(LTS) |

### 步驟 4:加入 SPA fallback(建議)

在「Add Environment Variables」上方不用設定;點擊專案建立前,在專案設定中新增以下內容(或建好後加在專案根目錄並推送,見下方)。

在倉庫根目錄新增 `vercel.json`(已包含在下方的補充說明),再執行:

```
git add vercel.json
git commit -m "add vercel SPA fallback config"
git push origin master
```

### 步驟 5:部署

點擊「Deploy」。約 1-2 分鐘後部署完成,Vercel 會提供一個 `https://kr-travel-xxx.vercel.app` 網址。每次 `git push` 都會自動重新部署。

## 方法二:部署到 Netlify

### 步驟 1:建立 Netlify 帳號並連結 GitHub

前往 https://app.netlify.com/signup,選擇「GitHub - Deploy with GitHub」授權登入。

### 步驟 2:新增網站

在 Dashboard 點擊「Add new site → Import an existing project → GitHub」,授權 Netlify 存取倉庫後選擇 **kr_travel**。

### 步驟 3:建置設定

| 設定項 | 值 |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |

### 步驟 4:加入 SPA fallback(建議)

點擊「Advanced build settings → Add redirect」,新增一條:

| Source path | Destination | Status code |
| --- | --- | --- |
| `/*` | `/index.html` | 200 |

或在倉庫根目錄新增 `netlify.toml`(內容見下方補充說明)後推送。

### 步驟 5:部署

點擊「Deploy site」。約 1-2 分鐘完成,Netlify 提供 `https://xxx.netlify.app` 網址,之後每次 `git push` 自動重新部署。

## 補充:SPA fallback 設定檔內容

**vercel.json**(放在倉庫根目錄):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**netlify.toml**(放在倉庫根目錄):

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

> 這是單頁應用常見需求:當使用者在 /itinerary 頁面按瀏覽器重新整理時,伺服器會把請求重導到 index.html,讓 React Router 接手路由,避免 404。

## 自訂網域(選用)

兩平台都支援綁定自有網域(例如 travel.mydomain.com):在專案設定的「Domains」頁面新增網域,依提示到網域註冊商加入 CNAME 記錄即可,HTTPS 憑證自動發放。

## 部署後在手機安裝

- **Android Chrome**:開啟部署網址 → 瀏覽器選單 →「安裝應用程式」或「加到主畫面」。
- **iPhone Safari**:開啟部署網址 → 分享按鈕 →「加入主畫面」。

安裝後即可像原生 App 一樣從主畫面開啟,並享有離線瀏覽能力。
