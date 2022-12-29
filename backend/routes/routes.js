const express = require("express");
const Model = require("../model/model");

const router = express.Router();

module.exports = router;

//Post Method
router.post("/post", async (req, res) => {
  const data = new Model({
    name: req.body.name,
    age: req.body.age,
  });

  try {
    const dataToSave = data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Get all Method
router.get("/getAll", async (req, res) => {
  try {
    const data = await Model.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Get by ID Method
router.get("/getOne/:id", async (req, res) => {
  try {
    const data = await Model.findById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Update by ID Method
router.patch("/update/:id", (req, res) => {
  res.send("Update by ID API");
});

//Delete by ID Method
router.delete("/delete/:id", (req, res) => {
  res.send("Delete by ID API");
});

//Get all Method
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
