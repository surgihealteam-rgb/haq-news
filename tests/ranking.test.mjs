import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Keep a JavaScript mirror of the ranking contract for dependency-free smoke tests.
function rankStories(stories, interests, query = "") {
  const q = query.trim().toLowerCase(); const normalizedInterests = interests.map((x) => x.toLowerCase());
  return stories.filter((s) => !q || [s.title,s.summary,s.category,s.region,...s.tags].join(" ").toLowerCase().includes(q)).map((story,index) => {
    const searchable = [story.category,story.region,...story.tags].join(" ").toLowerCase();
    const matches = normalizedInterests.filter((i) => searchable.includes(i)).length;
    const ageHours = Math.max(0,(Date.now()-new Date(story.updatedAt).getTime())/3600000);
    const recency = Number.isFinite(ageHours) ? Math.max(0,24-Math.min(24,ageHours))/24 : 0;
    return { story, score: matches*10+recency, index };
  }).sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.story);
}
const stories = [
 {id:"a",title:"Science research",summary:"paper",category:"Science",region:"Global",tags:["Research"],updatedAt:new Date().toISOString()},
 {id:"b",title:"World markets",summary:"markets",category:"Economy",region:"Global",tags:["Finance"],updatedAt:new Date().toISOString()},
];
test("topic interests rank matching stories first",()=>{assert.equal(rankStories(stories,["Science"])[0].id,"a")});
test("search filters stories case-insensitively",()=>{assert.deepEqual(rankStories(stories,[],"MARKETS").map(s=>s.id),["b"])});
test("empty query retains every story",()=>{assert.equal(rankStories(stories,[]).length,2)});
test("starter visibly marks demo mode and source status",()=>{const root=dirname(fileURLToPath(import.meta.url));const page=readFileSync(join(root,"../src/components/newsroom.tsx"),"utf8");assert.match(page,/DEMO MODE/);assert.match(page,/Not verified/)});
