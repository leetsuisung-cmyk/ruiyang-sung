# 字型授權說明

`NotoSansTC-Regular.ttf` / `NotoSansTC-Bold.ttf` 取自 Google Fonts「Noto Sans TC」（透過
`@fontsource/noto-sans-tc` 套件的 chinese-traditional 子集抽出，原始格式為 WOFF2，
用 `wawoff2` 解壓縮還原成 TTF），授權為 SIL Open Font License 1.1，
可自由使用、修改、嵌入 PDF。詳細授權內容參見 https://scripts.sil.org/OFL

**為何用 TTF 而非 WOFF2**：`fontkit`（PDF 產生時用來做字型 subset 的套件）處理這個字型的 WOFF2
版本時，subset 出來的檔案異常肥大（實測 122 個字產生出 10MB+ 的 PDF），原因是 WOFF2 的
loca table transform 疑似讓 fontkit 的子集邏輯出錯；改用解壓縮後的 TTF 格式，同樣 122 個字
的子集只有約 26KB，PDF 產生正常。若日後要更新字型，記得比照辦理（用 TTF/OTF，不要直接用
WOFF2）。

注意：此子集為 Google Fonts 依常用字範圍切出的版本，涵蓋繁體中文常用字＋基本英數與半形標點，
但**不含全形標點**（如全形冒號 `：`、全形逗號 `，`、全形斜線 `／`）。PDF 版面請一律使用半形標點
（`:`、`,`、`/`、`-`），否則會顯示缺字方框。若日後需要顯示罕見字或全形標點，需替換為完整版
Noto Sans TC 字型檔（檔案較大，約數十 MB）。
