import { NextResponse } from "next/server";

const ALFA_BASE = "https://alfa-leetcode-api.onrender.com";
const MODEL_NAME = "moonshotai/Kimi-K2-Thinking";

// ---------------- fetch helper ----------------
async function getJSON(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.log("[GET ERROR]", url, err);
    return null;
  }
}

// ---------------- user debug ----------------
async function debugUser(username: string, limit: number) {
  const out: any = {};

  const profile = await getJSON(`${ALFA_BASE}/${username}`);
  const solved = await getJSON(`${ALFA_BASE}/${username}/solved`);
  const submissions = await getJSON(
    `${ALFA_BASE}/${username}/submission?limit=${limit}`
  );

  out.profile = profile;
  out.solved = solved;
  out.submissions_raw = submissions;

  let submissionsList: any[] = [];

  if (Array.isArray(submissions)) submissionsList = submissions;
  if (submissions && typeof submissions === "object") {
    for (const key of ["submissions", "data", "submissionList", "subs"]) {
      if (Array.isArray(submissions[key])) {
        submissionsList = submissions[key];
        break;
      }
    }
  }

  out.submissions_list = submissionsList.map((s: any) => ({
    raw: s,
    status: s.status || s.verdict || s.statusDisplay,
    title: s.title || s.questionTitle,
    slug: s.titleSlug || s.slug,
    difficulty: s.difficulty,
    timestamp: s.timestamp,
  }));

  return out;
}

// ---------------- build stats ----------------
function buildLeetcodeStats(debug: any) {
  const solved = debug.solved || {};

  const solved_easy =
    solved.easy ||
    solved.Easy ||
    solved.solved_easy ||
    solved?.acSubmissionNum?.find?.((x: any) => x.difficulty === "Easy")
      ?.count ||
    0;

  const solved_medium =
    solved.medium ||
    solved.Medium ||
    solved.solved_medium ||
    solved?.acSubmissionNum?.find?.((x: any) => x.difficulty === "Medium")
      ?.count ||
    0;

  const solved_hard =
    solved.hard ||
    solved.Hard ||
    solved.solved_hard ||
    solved?.acSubmissionNum?.find?.((x: any) => x.difficulty === "Hard")
      ?.count ||
    0;

  const subs = debug.submissions_list || [];

  const recent_submissions = subs.map((s: any) => ({
    slug: s.slug,
    title: s.title,
    verdict: s.status,
    difficulty: s.difficulty,
  }));

  const failed = recent_submissions
    .filter(
      (s: any) =>
        !String(s.verdict || "")
          .toLowerCase()
          .startsWith("ac")
    )
    .map((s: any) => s.slug)
    .filter(Boolean);

  return {
    solved_easy,
    solved_medium,
    solved_hard,
    recent_failed_topics: [...new Set(failed)].slice(0, 10),
    recent_submissions: recent_submissions.slice(0, 200),
  };
}

// ---------------- ask Kimi ----------------
async function askKimi(modelInput: any) {
  const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
  if (!HF_TOKEN) throw new Error("Missing HF_TOKEN in .env");

  const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HF_TOKEN}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      max_tokens: 700,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You are a specialist assistant that ONLY answers DSA questions.Return only valid JSON. Absolutely nothing else.  Keep the entire response under 800 characters.  Do not add extra text, comments, or explanations.  ",
        },
        { role: "user", content: JSON.stringify(modelInput) },
      ],
    }),
  });
  console.log("KIMI RESPONSE STATUS:", res);
  const json = await res.json();
  console.log("KIMI RESPONSE JSON:", json);

  return json.choices?.[0]?.message?.content || "";
}

// ---------------- parse JSON from Kimi output ----------------
function extractJSON(text: string) {
  // remove ```json and ``` if present
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON parse failed:", e);
    return null;
  }
}

// ---------------- API Route ----------------
export async function POST(req: Request) {
  try {
    const { username, question, sub_limit } = await req.json();

    const debug = await debugUser(username, sub_limit || 300);
    const stats = buildLeetcodeStats(debug);

    const modelInput = { question, leetcode_stats: stats };

    const raw = await askKimi(modelInput);
    const parsed = extractJSON(raw);
    console.log("KIMI RAW OUTPUT:", raw);
    console.log("KIMI PARSED OUTPUT:", parsed);
    return NextResponse.json({
      stats, // <-- return stats properly
      raw,
      parsed,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
