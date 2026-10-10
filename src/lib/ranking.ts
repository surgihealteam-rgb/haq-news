import type { NewsStory } from "@/lib/types";

export function rankStories(stories: NewsStory[], interests: string[], query = ""): NewsStory[] {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedInterests = interests.map((x) => x.toLowerCase());
  return stories
    .filter((story) => {
      if (!normalizedQuery) return true;
      const searchable = [story.title, story.summary, story.category, story.region, ...story.tags].join(" ").toLowerCase();
      return searchable.includes(normalizedQuery);
    })
    .map((story, index) => {
      const searchable = [story.category, story.region, ...story.tags].join(" ").toLowerCase();
      const matchCount = normalizedInterests.filter((interest) => searchable.includes(interest)).length;
      const ageHours = Math.max(0, (Date.now() - new Date(story.updatedAt).getTime()) / 3_600_000);
      const recencyScore = Number.isFinite(ageHours) ? Math.max(0, 24 - Math.min(24, ageHours)) / 24 : 0;
      return { story, score: matchCount * 10 + recencyScore, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ story }) => story);
}
