import { getSeriesSummaries } from '../lib/series';

// The series feed, like rss.xml is the post feed: facts about each series and nothing shaped for one reader.
// Read by the site search (outer fields only; `posts` just gives the count) and later by Island
// (island.jasperhung.dev), which derives its own extras (home, links) instead of adding them here.
export async function GET() {
  return new Response(JSON.stringify(await getSeriesSummaries()), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
