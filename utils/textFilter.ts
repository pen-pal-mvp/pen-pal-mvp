// utils/textFilter.ts

export function containsPersonalInfo(text: string): boolean {
  if (!text) return false;

  // LINE, カカオトーク, インスタ等のID交換を狙ったキーワードやパターン
  const patterns = [
    /line(?:id| ID| id|아이디)?\s*[:：]\s*[a-zA-Z0-9_.-]+/i,
    /kakao(?:talk| ID| id|톡|아이디)?\s*[:：]\s*[a-zA-Z0-9_.-]+/i,
    /ig|instagram|인스타\s*[:：]\s*@[a-zA-Z0-9_.-]+/i,
    /0[89]0[-]?\d{4}[-]?\d{4}/, // 電話番号（日本）
    /010[-]?\d{4}[-]?\d{4}/, // 電話番号（韓国）
  ];

  return patterns.some(pattern => pattern.test(text));
}