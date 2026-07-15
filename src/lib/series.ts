// 系列 ID → 顯示名稱。文章 frontmatter 的 `series` 填 kebab-case ID，
// 新系列在這裡註冊；未註冊的 ID fallback 顯示 ID 本身。
export const SERIES: Record<string, string> = {
  openmemory: 'OpenMemory',
  'session-is': 'Session is',
  spokenly: 'Spokenly 語音聽寫',
};

export function seriesLabel(id: string): string {
  return SERIES[id] ?? id;
}
