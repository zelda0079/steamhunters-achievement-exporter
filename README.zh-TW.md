# SteamHunters 成就匯出工具

[English](README.md) | **繁體中文**

一款 Tampermonkey 使用者腳本，可將 SteamHunters 的遊戲成就資料匯出成 CSV 檔案，方便使用 Excel 開啟、整理及排序。

## 功能特色

- **自動識別 Steam App ID**：根據目前 SteamHunters 成就頁面的網址，自動取得遊戲 App ID，無需手動輸入。
- **支援不同成就頁面**：支援公開成就頁面及個人玩家成就頁面。
- **頁面快捷按鈕**：在頁面右上角加入「↓ Export CSV」按鈕，按下後才會開始匯出。
- **嘗試載入完整成就清單**：匯出前自動向下捲動頁面，嘗試觸發 SteamHunters 的延遲載入。
- **匯出豐富資料**：包含成就名稱、說明、解鎖時間、玩家數量、點數、完成率、稀有度、Steam 解鎖比例、圖片網址及成就網址等欄位。
- **Excel 友善日期格式**：將解鎖時間轉換為 YYYY-MM-DD HH:MM:SS（24 小時制），方便按時間先後排序。
- **UTF-8 BOM 編碼**：改善 Excel 開啟 CSV 時的中文字元相容性。

## 安裝方式

1. 先在瀏覽器安裝 [Tampermonkey](https://www.tampermonkey.net/)。
2. 開啟 [SteamHunters Achievement Exporter 使用者腳本](https://raw.githubusercontent.com/zelda0079/steamhunters-achievement-exporter/main/steamhunters-achievement-exporter.user.js)。
3. Tampermonkey 顯示安裝頁面後，確認安裝。
4. 開啟任何符合支援格式的 SteamHunters 成就頁面。
5. 頁面右上角會出現 **↓ Export CSV** 按鈕，點擊即可開始匯出。

## 支援的頁面網址

- 公開成就頁面：https://steamhunters.com/apps/{APPID}/achievements
- 個人玩家成就頁面：https://steamhunters.com/id/{username}/apps/{APPID}/achievements

其中 APPID 會由腳本自動識別，不需要自行修改程式碼。

## CSV 匯出欄位

| 欄位 | 說明 |
|---|---|
| app_id | Steam 遊戲 App ID |
| achievement_id | SteamHunters 成就頁面識別碼 |
| name | 成就名稱 |
| description | 成就說明 |
| unlocked_at | 解鎖日期及時間（YYYY-MM-DD HH:MM:SS） |
| unlocked_users | 已解鎖玩家數量 |
| total_players | 統計中的玩家總數 |
| points | 成就點數 |
| completion_percentage | SteamHunters 顯示的完成比例 |
| rarity | 成就稀有度 |
| steam_unlock_percentage | Steam 平台解鎖比例 |
| internal_key | SteamHunters 顯示的 Internal Key |
| api_name | Steam API 成就名稱 |
| image_url | 成就圖片網址 |
| achievement_url | 成就頁面網址 |
| raw_text | 成就卡片原始文字整理結果 |

## 注意事項及限制

- 腳本依賴 SteamHunters 目前的網頁 HTML 結構；如果網站更新頁面版面或元素名稱，可能需要修改選取器才能繼續正常運作。
- 腳本會透過向下捲動頁面觸發延遲載入，但實際匯出數量仍取決於 SteamHunters 是否成功載入所有成就卡片。
- 腳本讀取的是目前頁面已呈現的資料，不會呼叫私人 API，也不會繞過網站的存取限制。
- Excel 通常可以直接識別匯出的日期時間格式。如果日期被當作一般文字處理，可使用 Excel 的「資料 → 分列」功能轉換。

## 授權條款

本專案採用 MIT License。詳情請參閱 [LICENSE](LICENSE)。
