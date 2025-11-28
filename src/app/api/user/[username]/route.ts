import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  const BASE = "https://alfa-leetcode-api.onrender.com";


  try {
    const [
      profileRes,
      solvedRes,
      contestRes,
      submissionsRes,
      badgesRes,
      langRes,
    ] = await Promise.all([
      fetch(`${BASE}/${username}`),
      fetch(`${BASE}/${username}/solved`),
      fetch(`${BASE}/${username}/contest`),
      fetch(`${BASE}/${username}/submission`),
      fetch(`${BASE}/${username}/badges`),
      fetch(`${BASE}/${username}/language`),
    ]);

    const profile = await profileRes.json();
    const solved = await solvedRes.json();
    const contest = await contestRes.json();
    const submissions = await submissionsRes.json();
    const badges = await badgesRes.json();
    const languageStats = await langRes.json();

    // If no profile exists
    if (!profile || profile.error) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log([username, profile, solved, contest, submissions, badges]);

    return NextResponse.json(
      {
        username,

        profile,           // full profile
        solved,            // solved counts
        contest,           // contest rating/details
        submissions,       // recent submissions
        badges,            // LC badges
        languages: languageStats,  // language stats

        summary: {
          totalSolved: solved?.solved || 0,
          easy: solved?.easySolved || 0,
          medium: solved?.mediumSolved || 0,
          hard: solved?.hardSolved || 0,
          ranking: profile?.ranking,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch LeetCode data" },
      { status: 500 }
    );
  }
}
