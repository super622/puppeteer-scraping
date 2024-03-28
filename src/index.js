const express = require("express");
const unirest = require("unirest");
const cheerio = require("cheerio");
const fs = require("fs");
const Zillow = require("node-zillow");

const app = express();
const port = process.env.PORT || 5000;
const zillow_ = new Zillow("your key here");
require("dotenv").config();
const parameters = {
  address: "2114 Bigelow Ave",
  citystatezip: "Seattle, WA",
  rentzestimate: false,
};

app.use(express.json());

async function zillow() {
  const api_key = process.env.API_KEY
  const target_url =
    `https://api.scrapingdog.com/scrape?api_key=${api_key}&url=https://www.zillow.com/homes/&dynamic=false&premium=true&country=us`;
  const zillow_data = await unirest.get(target_url);
  const $ = cheerio.load(zillow_data.body);
  let housesInfo = [];
  if (zillow_data.statusCode === 200) {
    $(
      "ul li.ListItem-c11n-8-100-4__sc-13rwu5a-0.StyledListCardWrapper-srp-8-100-4__sc-wtsrtn-0"
    ).each(function () {
      const price = $(this)
        .find('span[data-test="property-card-price"]')
        .text();
      const address = $(this)
        .find('address[data-test="property-card-addr"]')
        .text();

      const bedrooms = [];
      $(this)
        .find('span[data-test="property-card-price"]')
        .parent()
        .parent()
        .next()
        .children("ul")
        .children("li")
        .each(function () {
          bedrooms.push($(this).text());
        });

      if (!address) {
        return;
      }

      housesInfo.push({
        address,
        bedrooms: bedrooms.join(" - "),
        price,
      });
    });

    return housesInfo;
  }
}

app.get("/api_zillow", (req, res) => {
  const zillow_result = zillow_.get("GetSearchResults", parameters).then((results) => {
    return results;
  });
  res.json({ message: "Hello from the backend!",zillow_result });
});


app.get("/datazillow", async (req, res) => {
  const url = "https://www.zillow.com/homes/";

  if (!url) {
    return res.status(400).send("URL parameter is required");
  }
  try {
    const result = await zillow();
    const jsonData_result = JSON.stringify(result);
    fs.readFile("src/data.json", "utf8", (err, data) => {
      if (err) {
        console.error("An error occurred while reading the file:", err);
        return;
      }

      // Parse the JSON data
      const jsonData = JSON.parse(data);

      // Update the array (example: add a new element)
      result.forEach((element) => {
        jsonData.push(element);
      });
      // Convert the updated array to a JSON string
      const updatedJsonData = JSON.stringify(jsonData);

      // Write the updated JSON string back to the file
      fs.writeFile("src/data.json", updatedJsonData, "utf8", (err) => {
        if (err) {
          console.error("An error occurred while writing to the file:", err);
          return;
        }
        console.log("Array updated and saved to data.json successfully.");
      });
    });
    res.json({ message: "success", result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Error occurred while scraping", error: error });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
