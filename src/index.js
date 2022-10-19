const TwitterClient = require("twitter-api-client").TwitterClient;
const Octokit = require("@octokit/core").Octokit;
const dotenv = require("dotenv");
dotenv.config();

// JavaScript repos
const FRAMEWORKS = [
  { owner: "vuejs", repo: "vue" },
  { owner: "vercel", repo: "next.js" },
  { owner: "facebook", repo: "react" },
  { owner: "angular", repo: "angular" },
  { owner: "nuxt", repo: "nuxt.js" },
  { owner: "sveltejs", repo: "svelte" },
];

const MAP_NAMES = {
  vue: "Vue",
  "next.js": "Next.js",
  react: "React",
  angular: "Angular",
  "nuxt.js": "Nuxt.js",
  svelte: "Svelte",
};

// Create the Twitter client
const twitterClient = new TwitterClient({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_KEY_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
});

// Create the GitHub client
const octokit = new Octokit({ auth: process.env.GH_TOKEN });

/**
 * Get the labels and stars of the given repositories in GitHub with the Octokit client
 * @param {Array} frameworks - Array of objects with the owner and repo properties
 * @returns {Array} Array of objects with the label (name) and stars properties
 */
const getGhLabelsAndStars = async (frameworks) => {
  const labelsAndStars = await Promise.all(
    frameworks.map(async (framework) => {
      const { owner, repo } = framework;
      const { data } = await octokit.request("GET /repos/{owner}/{repo}", {
        owner,
        repo,
      });
      const { stargazers_count: stars, name: label } = data;
      return { label, stars };
    })
  );
  return labelsAndStars;
};

/**
 * Sort the array of objects by the number of stars
 * @param {Array} data Array of objects with the label (name) and stars properties
 * @returns
 */
const sortByStars = (data) => data.sort((a, b) => b.stars - a.stars);

const main = async () => {
  const labelsAndStars = await getGhLabelsAndStars(FRAMEWORKS);

  // Sort the frameworks by the number of stars
  const sortedByStars = sortByStars(labelsAndStars);

  // Date in the format: dd/mm/yyyy
  const date = new Date();
  const formattedDate = `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()}`;

  // Compose the tweet
  const tweet = `✨ Frameworks de JavaScript más populares en GitHub el ${formattedDate}:

${sortedByStars
  .map(
    ({ label, stars }, index) =>
      `${index + 1} · ${MAP_NAMES[label]}: ${stars} ⭐️`
  )
  .join("\n")}

#JavaScriptBot #JavaScriptWars #GitHub #JavaScript #NodeJS`;

  console.log(tweet);
  console.log(`Count: ${tweet.length}`);

  try {
    // Send the tweet
    await twitterClient.tweets.statusesUpdate({ status: tweet });
    console.log("Tweeted!");
  } catch (error) {
    console.log("Twitter client error", error);
  }
};

main();

module.exports = {
  main,
  getGhLabelsAndStars,
  sortByStars,
};
