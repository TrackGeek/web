import { useQuery } from "@tanstack/react-query";

const GITHUB_ORG = "TrackGeek";
const ONE_HOUR = 1000 * 60 * 60;

type GithubRepo = {
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
};

export function useGithubStars() {
  return useQuery({
    queryKey: ["github-stars", GITHUB_ORG],
    queryFn: async () => {
      const response = await fetch(`https://api.github.com/orgs/${GITHUB_ORG}/repos?per_page=100&type=public`, {
        headers: { Accept: "application/vnd.github+json" },
      });

      if (!response.ok) {
        throw new Error(`GitHub API responded with ${response.status}`);
      }

      const repos = (await response.json()) as GithubRepo[];

      return repos.reduce((total, repo) => (repo.fork || repo.archived ? total : total + repo.stargazers_count), 0);
    },
    enabled: typeof window !== "undefined",
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR,
    retry: false,
  });
}
