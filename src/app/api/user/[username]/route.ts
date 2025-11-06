import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { username } }),
    });

    const json = await res.json();
    if (!json.data || !json.data.matchedUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const stats = json.data.matchedUser.submitStatsGlobal.acSubmissionNum;

    const easy = stats.find((s: any) => s.difficulty === "Easy")?.count || 0;
    const medium = stats.find((s: any) => s.difficulty === "Medium")?.count || 0;
    const hard = stats.find((s: any) => s.difficulty === "Hard")?.count || 0;

    const totalSubmissions =
      stats.reduce((acc: number, s: any) => acc + s.submissions, 0) || 1;
    const totalAccepted =
      stats.reduce((acc: number, s: any) => acc + s.count, 0);

    const accuracy = totalAccepted / totalSubmissions;
    const totalProblems = 3100; // Approx total number of problems
    const solved = easy + medium + hard;

    // Approximate avg_accept_rate same as accuracy (no per-question rates available)
    const avg_accept_rate = accuracy;

    return NextResponse.json({
      solved_easy: easy,
      solved_medium: medium,
      solved_hard: hard,
      total_problems: totalProblems,
      solved,
      accuracy: parseFloat(accuracy.toFixed(3)),
      avg_accept_rate: parseFloat(avg_accept_rate.toFixed(3)),
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
