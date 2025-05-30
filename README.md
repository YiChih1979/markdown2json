# n8n Markdown 轉 LINE 格式轉換器

這是一個專為 n8n 設計的函數，能夠將 AI 輸出的 markdown 格式轉換為 LINE Bot 可以使用的 JSON 結構。

## 功能特色

- ✅ 自動轉換為 LINE Flex Message 格式
- ✅ 長文字自動降級為簡單文字格式
- ✅ 符合 n8n 資料結構規範
- ✅ 支援中文註解和說明
- ✅ 使用 giga 尺寸提供最寬的訊息顯示
- ✅ 粗體文字使用深藍色突出顯示

## 支援的 Markdown 語法

| Markdown 語法 | 轉換結果 | 說明 |
|---------------|----------|------|
| `# 標題` | 大標題 | 轉換為 LG 大小的粗體深藍色文字 |
| `## 副標題` | 中標題 | 轉換為 MD 大小的粗體深藍色文字 |
| `### 小標題` | 小標題 | 轉換為 SM 大小的一般文字 |
| `**粗體**` | 粗體文字 | 轉換為深藍色粗體文字 |
| `*斜體*` | 斜體文字 | 轉換為一般文字 |
| `- 清單項目` | • 清單項目 | 轉換為項目符號清單 |
| `1. 編號清單` | 1. 編號清單 | 保持編號格式 |
| `` `程式碼` `` | 程式碼 | 轉換為深灰色文字 |
| ```` ```程式碼區塊``` ```` | 程式碼區塊 | 轉換為深灰色文字區塊 |
| `[連結文字](URL)` | 可點擊連結 | 轉換為可點擊的藍色連結 |
| `> 引用文字` | "引用文字" | 轉換為引用格式 |

## 安裝與使用

### 步驟：在 n8n 中創建 Code 節點

1. 在您的 n8n 工作流程中添加一個 **Code** 節點
2. 將 `markdown-to-line-converter.js` 的內容複製到 Code 節點中
3. 確保 Code 節點設定為 **JavaScript** 模式

### LINE Flex Message 優化
- 使用 `giga` 尺寸提供最寬的訊息顯示空間
- 所有文字元件都支援自動換行 (`wrap: true`)
- 適當的間距和內邊距設定

## 授權

本專案採用 MIT 授權條款。
