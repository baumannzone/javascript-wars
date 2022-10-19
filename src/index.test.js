const { sortByStars, getGhLabelsAndStars } = require("./index.js");
const Octokit = require("@octokit/core").Octokit;

describe("sortByStars", () => {
  it("should sort the data by the number of stars", () => {
    const data = [
      { label: "react", stars: 20 },
      { label: "vue", stars: 100 },
    ];
    const sortedData = sortByStars(data);

    expect(sortedData).toEqual([
      { label: "vue", stars: 100 },
      { label: "react", stars: 20 },
    ]);
  });
});

describe("getGhLabelsAndStars", () => {
  const octokit = new Octokit({ auth: process.env.GH_TOKEN });
  it("should return an array of objects with label and stars", async () => {
    const data = { owner: "facebook", repo: "react" };
    const dataRepo = await getGhLabelsAndStars([data]);

    const resp = await octokit.request("GET /repos/{owner}/{repo}", {
      owner: data.owner,
      repo: data.repo,
    });
    const { stargazers_count: stars, name: label } = resp.data;
    expect(dataRepo).toEqual([{ label: label, stars: stars }]);
  });
});
