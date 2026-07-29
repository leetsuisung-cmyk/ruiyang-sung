-- 資料修正（保險版）：移除目的地欄位中的所有反斜線並去除前後空白
UPDATE "Tour" SET "departureCountry" = trim(replace("departureCountry", '\', ''));
UPDATE "Order" SET "departureCountry" = trim(replace("departureCountry", '\', '')) WHERE "departureCountry" IS NOT NULL;
