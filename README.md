# YouTube 嵌入小廣告 Chrome 插件

這是一個Chrome瀏覽器插件，可以讓您在當前瀏覽的網頁上嵌入YouTube影片，偽裝成小廣告的形式播放。

## 功能特色

- 🎬 支援任何YouTube影片網址
- 📍 可選擇左下角或右下角位置
- 📏 可調整影片尺寸（200px - 500px）
- 🎨 偽裝成廣告樣式，帶有紅色邊框和脈衝動畫
- ❌ 一鍵關閉功能
- 💾 自動儲存設定

## 安裝方法

1. 下載或克隆此專案到本地
2. 打開Chrome瀏覽器
3. 進入 `chrome://extensions/`
4. 開啟「開發人員模式」
5. 點擊「載入未封裝項目」
6. 選擇此專案資料夾

## 使用方法

1. 點擊瀏覽器工具列中的插件圖標
2. 在彈出視窗中輸入YouTube影片網址
3. 選擇影片位置（左下角或右下角）
4. 調整影片尺寸
5. 點擊「嵌入影片」按鈕
6. 影片將以廣告形式出現在頁面上

## 支援的YouTube網址格式

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

## 檔案結構

```
youtube-embed-extension/
├── manifest.json      # 插件配置檔案
├── popup.html         # 彈出視窗HTML
├── popup.js           # 彈出視窗JavaScript
├── content.js         # 內容腳本
├── content.css        # 內容樣式
├── icons/             # 圖標資料夾
└── README.md          # 說明文件
```

## 技術特色

- 使用Chrome Extension Manifest V3
- 響應式設計，支援手機版瀏覽
- 平滑的動畫效果
- 自動儲存使用者設定
- 防止與其他元素衝突

## 注意事項

- 此插件僅供學習和測試用途
- 請遵守YouTube的使用條款
- 建議在測試環境中使用

## 授權

MIT License
