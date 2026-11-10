import { getCollection } from "astro:content";

export type SeriesType = "series" | "collection";

export type SeriesList = {
  title: string;
  description: string;
  type: SeriesType;
  cover?: string;
};

export const seriesLists = {
  "ithome-2026-ironman": {
    title: "iThome 2026 鐵人賽：跟著 Claude Academy，重新認識 Claude",
    description:
      "每天都在用 AI，不代表真的了解手上的工具。iThome 2026 鐵人賽跟著官方 Claude Academy，30 天重新學習 Claude，收集學習徽章，也記錄實際踩坑與應用經驗。",
    type: "series",
    cover: "/images/series/ithome-2026-ironman.webp",
  },
  "orca-ade": {
    title: "Orca ADE",
    description: "以 Agent 為核心，整合 IDE、Git、worktree 與 remote control 的開發環境實測：用 Orca CLI 跨 LLM 派工、從 iPhone 接管桌面 ADE，以及啟動第二個 Claude 帳號。",
    type: "series",
    cover: "/images/series/orca-ade.jpg",
  },
  "bing-webmaster-tools": {
    title: "Bing Webmaster Tools",
    description: "把部落格交給 Bing：從收錄、IndexNow、Cloudflare Crawler Hints 到 Site Scan 全站健檢的實測紀錄。",
    type: "collection",
    cover: "/images/series/bing-webmaster-tools.jpg",
  },
  cloudflare: {
    title: "Cloudflare",
    description: "把 Cloudflare 當成部落格的前門：DNS、Proxy、快取規則、robots.txt 與各種診斷建議的實際設定紀錄。",
    type: "collection",
    cover: "/images/series/cloudflare.jpg",
  },
  "azure-devops-pipelines": {
    title: "Azure DevOps Pipelines",
    description: "Azure DevOps Pipelines 的自動化與權限筆記，涵蓋 System.AccessToken、PR 與 Wiki API、repository 存取、排程及 pipeline 觸發。",
    type: "series",
    cover: "/images/series/azure-devops-pipelines.jpg",
  },
  "macos-fix": {
    title: "macOS 修復筆記",
    description: "升級 macOS 26 後發燙、CPU 無故飆高、Intel app 跳警告：從 BetterDisplay 的 CPU bug、Spotlight 啟動掃描到 Sublime Text 升級，Mac 出狀況時的實際排查過程與解法。",
    type: "collection",
    cover: "/images/series/macos-fix.jpg",
  },
  "mac-tools": {
    title: "Mac 工具箱",
    description: "讓 Mac 更好用的工具：BetterDisplay 的 HiDPI 縮放讓桌面降解析度仍保持文字銳利，Ports 找回 AI Agent 留下的 dev server，以及它們在開發工作流裡的實際用法。",
    type: "collection",
    cover: "/images/series/mac-tools.jpg",
  },
  spokenly: {
    title: "Spokenly 語音聽寫",
    description: "從 Typeless 訂閱制換到 Spokenly 按量計費，再把 STT 換成本地模型讓成本降 90%；也把聽寫歷史紀錄拿來調校 Prompt、做成 WPM Dashboard 的實作紀錄。",
    type: "series",
    cover: "/images/series/spokenly.jpg",
  },
  openmemory: {
    title: "OpenMemory",
    description: "跨 session、跨 LLM 的長期記憶怎麼做：從比較方案、用 Docker 與 MCP 本地自架 OpenMemory，到裝好之後決定什麼值得被記住的記憶策略。",
    type: "series",
    cover: "/images/series/openmemory.jpg",
  },
  "session-is": {
    title: "Session is",
    description: "把一次 AI 對話與任務，沉澱成下次仍能使用的知識與 Skill：用 MarkDownload 把網頁存成 Markdown、把對話整理進知識庫，再把做過的任務變成可呼叫的 SOP。",
    type: "series",
    cover: "/images/series/session-is.jpg",
  },
  "remote-control": {
    title: "Remote Control 方法地圖",
    description: "從 Tailscale、SSH 到 AI Agent 的各種遠端工作方式：手機 SSH App 怎麼選、Claude Code Remote Control 與 Codex Remote 比較、Claude Dispatch 派工，以及手機連不上 dev server 的排查。",
    type: "collection",
    cover: "/images/series/remote-control.jpg",
  },
  "agent-workflow": {
    title: "Agent Workflow",
    description: "把多帳號、Agent、Skills 與工作規則收斂成一套可持續演化的個人工作系統：三個 AI 帳號共用 Single Source of Truth、Claude 與 Codex 的角色載入、Skills 健檢與 system prompt 瘦身。",
    type: "collection",
    cover: "/images/series/agent-workflow.jpg",
  },
  "summon-agent": {
    title: "Summon Agent",
    description: "把 Agent、帳號與工作目錄組成可操作的召喚流程：從用 cmux CLI 召喚有明確職責的 AI、把輪詢式 Skill 拆成啟動指令，最後延伸到從手機召喚可接手的 Agent。",
    type: "series",
    cover: "/images/series/summon-agent.jpg",
  },
  "astro-blog": {
    title: "Astro Blog 建站筆記",
    description: "從買 domain、選 Astro 到 OG image、dark mode、燈箱與效能優化：這個部落格一路蓋起來的實作紀錄。",
    type: "collection",
    cover: "/images/series/astro-blog.jpg",
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

/** One series as /series.json publishes it: facts about the series only (see src/pages/series.json.ts). */
export type SeriesSummary = {
  id: string;
  title: string;
  description: string;
  type: SeriesType;
  cover: string | null;
  url: string;
  /** In reading order (seriesOrder, then date), the same order the series page numbers them. */
  posts: { slug: string; title: string; date: string }[];
  /** Slug of the newest post by date. */
  latest: string | null;
};

/** Joins seriesLists with the posts that point at each series. Series with no published post are left out. */
export async function getSeriesSummaries(): Promise<SeriesSummary[]> {
  const posts = await getCollection("blog");
  return Object.entries(seriesLists).flatMap(([id, item]) => {
    const members = sortSeriesEntries(posts.filter(post => post.data.series === id));
    if (members.length === 0) return [];
    const newest = members.reduce((a, b) => (b.data.date > a.data.date ? b : a));
    return [{
      id,
      title: item.title,
      description: item.description,
      type: item.type,
      cover: item.cover ?? null,
      url: `/series/${id}/`,
      posts: members.map(post => ({
        slug: post.id,
        title: post.data.title,
        date: post.data.date.toISOString(),
      })),
      latest: newest.id,
    }];
  });
}
