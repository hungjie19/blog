export type SeriesType = "series" | "collection";

export type SeriesList = {
  title: string;
  description: string;
  type: SeriesType;
  cover?: string;
};

export const seriesLists = {
  openmemory: {
    title: "OpenMemory",
    description: "把本地記憶接進 AI 工作流程後，如何建立可長期使用的記憶策略。",
    type: "series",
  },
  "session-is": {
    title: "Session is",
    description: "把一次 AI 對話與任務，沉澱成下次仍能使用的知識與 Skill。",
    type: "series",
  },
  spokenly: {
    title: "Spokenly 語音聽寫",
    description: "從語音輸入工具選擇到成本與自訂流程的實作紀錄。",
    type: "series",
  },
  "remote-control": {
    title: "Remote Control 方法地圖",
    description: "從 Tailscale、SSH 到 AI Agent 的各種遠端工作方式。",
    type: "collection",
  },
  "agent-workflow": {
    title: "Agent Workflow",
    description: "把多帳號、Agent、Skills 與工作規則收斂成一套可持續演化的個人工作系統。",
    type: "collection",
  },
  "summon-agent": {
    title: "Summon Agent",
    description: "把 Agent、帳號與工作目錄組成可操作的召喚流程，最後延伸到手機接手。",
    type: "series",
  },
} satisfies Record<string, SeriesList>;

export type SeriesId = keyof typeof seriesLists;

export function getSeries(id: string): SeriesList | undefined {
  return seriesLists[id as SeriesId];
}

export function seriesLabel(id: string): string {
  return getSeries(id)?.title ?? id;
}

type SeriesEntry = {
  id: string;
  data: {
    date: Date;
    seriesOrder?: number;
  };
};

export function sortSeriesEntries<T extends SeriesEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const orderA = a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
    const orderDifference = orderA - orderB;

    if (orderDifference !== 0) return orderDifference;

    const dateDifference = a.data.date.valueOf() - b.data.date.valueOf();
    return dateDifference !== 0 ? dateDifference : a.id.localeCompare(b.id);
  });
}
