const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const axios = require("axios");
const redis = require("redis");
const client = redis.createClient();

let lastHit = new Date();

// Route to Get News.
app.get("/autocomplete/:query", (req, res) => {
    const now = new Date();

    client.exists("autocomplete", (err, ok) => {
        if (ok && ((now.getTime() - lastHit.getTime()) / 1000) % 60 < 60) {
            client.get("analysis", (err, data) => {
                res.send(JSON.parse(data));
            });
        } else {
            const { query } = req.params;
            const autocompleteOptions = {
                method: "GET",
                url:
                    "https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete",
                params: { q: query, region: "US" },
                headers: {
                    "x-rapidapi-key": process.env.API_KEY,
                    "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
                }
            };
            axios
                .request(autocompleteOptions)
                .then(function(response) {
                    lastHit = new Date();
                    client.set("autocomplete", JSON.stringify(response.data));
                    res.send(response.data);
                })
                .catch(function(error) {
                    console.error(error);
                });
        }
    });
});

// Route to Get Analysis.
app.get("/analysis/:symbol", (req, res) => {
    const now = new Date();

    // Checking for Cache
    client.exists("analysis", (err, ok) => {
        if (err) console.log(err);

        // If cache is present and it is less than a minute old, return the cache.
        if (ok && ((now.getTime() - lastHit.getTime()) / 1000) % 60 < 60) {
            client.get("analysis", (err, data) => {
                res.send(JSON.parse(data));
            });
        } else {
            // Else, Do a network call and return the result.
            const { symbol } = req.params;
            const analysisOptions = {
                method: "GET",
                url:
                    "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-analysis",
                params: { symbol: symbol, region: "US" },
                // Sending API_KEY as a header.
                headers: {
                    "x-rapidapi-key": process.env.API_KEY,
                    "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
                }
            };

            axios
                .request(analysisOptions)
                .then(function(response) {
                    lastHit = new Date();
                    client.set("analysis", JSON.stringify(response.data));
                    res.send(response.data);
                })
                .catch(function(error) {
                    console.error(error);
                });
        }
    });
});

app.listen(PORT, () => console.log(`Server at ${PORT}`));
