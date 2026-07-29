-- 資料修正：關西好好玩的目的地「大阪\」多了一個反斜線，更正為「大阪」
UPDATE "Tour" SET "departureCountry" = '大阪' WHERE "departureCountry" = '大阪\';
