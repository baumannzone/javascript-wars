import { TwitterClient } from "twitter-api-client";
import { Octokit } from "@octokit/core";
import dotenv from "dotenv";
dotenv.config();

// JavaScript repos that are popular on GitHub
const FRAMEWORKS = [
  { owner: "vuejs", repo: "vue" },
  { owner: "vercel", repo: "next.js" },
  { owner: "facebook", repo: "react" },
  { owner: "angular", repo: "angular" },
  { owner: "nuxt", repo: "nuxt.js" },
  { owner: "sveltejs", repo: "svelte" },
];

// Create the Twitter client
const twitterClient = new TwitterClient({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_KEY_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
});

// Create the GitHub client
const octokit = new Octokit({ auth: process.env.GH_TOKEN });

const main = async () => {
  const labelsAndStars = await Promise.all(
    FRAMEWORKS.map(async ({ owner, repo }) => {
      // https://docs.github.com/es/rest/repos/repos#get-a-repository
      const response = await octokit.request("GET /repos/{owner}/{repo}", {
        owner,
        repo,
      });
      const { stargazers_count: stars, name: label } = response.data;
      return { label, stars };
    })
  );

  // Sort the frameworks by the number of stars
  const sortedByStars = labelsAndStars.sort((a, b) => b.stars - a.stars);

  // Compose the tweet
  const tweet = `✨ Frameworks de JavaScript ordenados por estrellas en GitHub:

${sortedByStars
  .map(({ label, stars }, index) => `${index + 1} • ${label}: ${stars} ⭐️`)
  .join("\n")}

#JavaScriptBot #JavaScriptWars
`;

  console.log(tweet);
  console.log(tweet.length);

  try {
    // Send the tweet
    await twitterClient.tweets.statusesUpdate({ status: tweet });
    console.log("Tweeted!");
  } catch (error) {
    console.log("Twitter client error", error);
  }
};

main();
