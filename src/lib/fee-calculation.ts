export type DiscountMode = "PER_PERSON" | "FLAT_GROUP";
export type DepositMode = "PER_PERSON" | "FLAT_GROUP";

export interface TourFeeConfig {
  pricePerPerson: number;
  discountAmount: number;
  discountMode: DiscountMode;
  depositAmount: number;
  depositMode: DepositMode;
}

export interface FeeCalculationResult {
  subtotal: number;
  totalDiscount: number;
  totalDue: number;
  depositRequired: number;
  balanceDue: number;
}

/**
 * 計算團費相關金額。前後端共用同一份邏輯：
 * 前端用來即時顯示試算結果，後端在建立訂單時重新呼叫一次以產生落地金額（不信任前端傳來的數字）。
 */
export function calculateFees(
  tour: TourFeeConfig,
  memberCount: number
): FeeCalculationResult {
  const subtotal = tour.pricePerPerson * memberCount;

  const totalDiscount =
    tour.discountMode === "PER_PERSON"
      ? tour.discountAmount * memberCount
      : tour.discountAmount;

  const totalDue = subtotal - totalDiscount;

  const rawDepositRequired =
    tour.depositMode === "PER_PERSON"
      ? tour.depositAmount * memberCount
      : tour.depositAmount;

  // 訂金不應超過應收合計（admin 若設定錯誤，clamp 避免出現負尾款）
  const depositRequired = Math.min(rawDepositRequired, Math.max(totalDue, 0));

  const balanceDue = totalDue - depositRequired;

  return {
    subtotal,
    totalDiscount,
    totalDue,
    depositRequired,
    balanceDue,
  };
}
