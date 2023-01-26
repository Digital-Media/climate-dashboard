const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

module.exports = router;

router.get("/getTif/:date", (req, res, next) => {
  var options = {
    root: path.join(__dirname, "../data/tif"),
  };
  console.log(req.params.date);
  var fileName = `AT_SPEI_${req.params.date}.tif`;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      res.send(
        `No data for following date could be found: ${req.params.date}. Make sure the date is in following format: "JJJJ-MM-DD"`
      );
    } else {
      console.log("Sent:", fileName);
    }
  });
});

router.get("/availableTifs/weekly/:year/:week?", (req, res) => {
  fs.readFile(path.join(__dirname, "../dates.json"), "utf8", (err, data) => {
    if (err) {
      throw err;
    }

    const year = req.params.year;
    const week = req.params.week;

    const input = JSON.parse(data);
    if (week) {
      res.json(input.dates_weekly[year][week]);
    } else {
      res.json(input.dates_weekly[year]);
    }
  });
});

router.get("/availableTifs/weekly", (req, res) => {
  fs.readFile(path.join(__dirname, "../dates.json"), "utf8", (err, data) => {
    if (err) {
      throw err;
    }
    const input = JSON.parse(data);
    let years = [];
    try {
      for (const [key, value] of Object.entries(input.dates_weekly)) {
        years.push(Number(key));
      }
      res.json(years);
    } catch (err) {
      console.log(err);
    }
  });
});

router.get("/availableTifs/daily/:month", (req, res) => {
  fs.readFile(path.join(__dirname, "../dates.json"), "utf8", (err, data) => {
    if (err) {
      throw err;
    }

    const month = req.params.month;

    const input = JSON.parse(data);
    res.json(JSON.stringify(input.dates_daily[month]));
  });
});

router.get("/convert", async (req, res) => {
  try {
    const fs = require("fs");

    function convertObject(obj) {
      const convertedArr = [];

      const features = obj.features.filter(
        (feature) => feature.properties.parameters.SPEI.data[0] !== null
      );

      let dataArr = [];
      features.forEach((feature) => {
        const data = feature.properties.parameters.SPEI.data[0];
        dataArr.push(data);
      });
      dataArr = dataArr.map(normalize(-2.5, 2.5));

      features.forEach((feature, i) => {
        const coordinates = feature.geometry.coordinates;
        convertedArr.push([coordinates[1], coordinates[0], dataArr[i]]);
      });
      return convertedArr;
    }

    function normalize(min, max) {
      const delta = max - min;
      return (val) => ((val < min ? min : val > max ? max : val) - min) / delta;
    }

    fs.readFile(
      "/home/node/climate-dashboard/backend/routes/input.json",
      "utf8",
      (err, data) => {
        if (err) {
          throw err;
        }

        const input = JSON.parse(data);
        const output = convertObject(input);

        fs.writeFile(
          "/home/node/climate-dashboard/backend/routes/output.json",
          JSON.stringify(output),
          (err) => {
            if (err) {
              throw err;
              return;
            }

            console.log("File saved successfully");
          }
        );
      }
    );
    res.send("Done!");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
