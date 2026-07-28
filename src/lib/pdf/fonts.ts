import path from "path";
import { Font } from "@react-pdf/renderer";

export const FONT_FAMILY = "Noto Sans TC";

let registered = false;

/** PDF 產生前務必先呼叫這個函式一次，註冊繁體中文字型（Noto Sans TC 常用字子集，僅含半形標點） */
export function registerPdfFonts(): void {
  if (registered) return;

  Font.register({
    family: FONT_FAMILY,
    fonts: [
      { src: path.join(process.cwd(), "src/lib/pdf/fonts/NotoSansTC-Regular.ttf"), fontWeight: "normal" },
      { src: path.join(process.cwd(), "src/lib/pdf/fonts/NotoSansTC-Bold.ttf"), fontWeight: "bold" },
    ],
  });

  // 中文字型沒有斷字連字號的概念，關閉自動斷字避免中文字被錯誤拆開
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}
