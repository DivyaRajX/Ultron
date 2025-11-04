import requests
import json
import time
from typing import List, Dict, Any
import pandas as pd


class LeetCodeClient:
    """Client for fetching user's solved problems from LeetCode GraphQL API."""
    
    def __init__(self):
        self.base_url = "https://leetcode.com/graphql"
        self.headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0"  # Simple UA to avoid 403
        }

    def get_user_solved_problems(self, username: str) -> List[Dict[str, Any]]:
        """Get list of problems solved by user, with difficulty and topics."""
        query = """
        query userProblemsSolved($username: String!) {
          allQuestionsCount {
            difficulty
            count
          }
          matchedUser(username: $username) {
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            submissionCalendar
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            topPercentage
          }
        }
        """
        
        detail_query = """
        query problemsetQuestionList($categorySlug: String, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            skip: $skip
            filters: $filters
          ) {
            total: totalNum
            questions: data {
              acRate
              difficulty
              title
              topicTags {
                name
              }
              status
            }
          }
        }
        """

        # First get overall stats
        resp = requests.post(
            self.base_url,
            headers=self.headers,
            json={"query": query, "variables": {"username": username}}
        )
        if not resp.ok:
            raise Exception(f"Failed to fetch user data: {resp.status_code}")

        data = resp.json()
        if "errors" in data:
            raise Exception(f"GraphQL errors: {data['errors']}")

        # Now get problem details - paginate through all problems
        all_problems = []
        skip = 0
        while True:
            resp = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "query": detail_query,
                    "variables": {
                        "categorySlug": "",
                        "skip": skip,
                        "filters": {}
                    }
                }
            )
            if not resp.ok:
                raise Exception(f"Failed to fetch problems: {resp.status_code}")

            problems_data = resp.json()
            if "errors" in problems_data:
                raise Exception(f"GraphQL errors: {problems_data['errors']}")

            problems = problems_data["data"]["problemsetQuestionList"]["questions"]
            if not problems:
                break

            all_problems.extend(problems)
            skip += len(problems)
            time.sleep(1)  # Be nice to LC API

        # Convert to DataFrame matching our CSV format
        rows = []
        for p in all_problems:
            if p["status"] == "ac":  # Only include solved
                rows.append({
                    "title": p["title"],
                    "difficulty": p["difficulty"].lower(),
                    "topic_tags": ",".join(t["name"] for t in p["topicTags"]),
                    "status": "solved"
                })

        return pd.DataFrame(rows)


if __name__ == "__main__":
    # Quick test
    client = LeetCodeClient()
    df = client.get_user_solved_problems("someuser")
    print(f"Found {len(df)} solved problems")