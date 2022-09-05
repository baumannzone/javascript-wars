const { sortByStars } = require("./index.js");

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
