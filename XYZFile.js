const fs = require('fs');

// Record the start time
const start_time = performance.now();

// File paths
const path = "C:\\Users\\b3pmfocp\\OneDrive - US Army Corps of Engineers\\Desktop\\FY23 J.F Costello Kaskaskia LD 05132024 Fulldataset - Copy.txt"; // Replace with the actual input file path
const outputPath = "C:\\Users\\b3pmfocp\\OneDrive - US Army Corps of Engineers\\Desktop\\OutputTest.json"; // Replace with the actual output file path

// Read the input file content
fs.readFile(path, 'utf8', (err, content) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  const lines = content.split('\n');

  const outputJson = {
    displayFieldName: "",
    fieldAliases: {
      "FID": "FID",
      "Elevation": "Elevation"
    },
    geometryType: "esriGeometryPoint",
    spatialReference: {
      wkid: 102696,
      latestWkid: 102696
    },
    fields: [
      {
        name: "FID",
        type: "esriFieldTypeOID",
        alias: "FID"
      },
      {
        name: "Elevation",
        type: "esriFieldTypeDouble",
        alias: "Elevation"
      }
    ]
  };

  const points = [];
  let count = 0;

  // Loop through each line and process the point data
  lines.forEach(line => {
    const pointList = line.split(" ");
    if (pointList.length >= 3) {
      const x_point = parseFloat(pointList[0].trim());
      const y_point = parseFloat(pointList[1].trim());
      const z_point = parseFloat(pointList[2].trim());

      const tempObj = {
        attributes: {
          FID: count,
          Elevation: z_point
        },
        geometry: {
          x: x_point,
          y: y_point
        }
      };

      points.push(tempObj);
      count++;
    }
  });

  outputJson.features = points;

  // Write the output JSON to a file
  fs.writeFile(outputPath, JSON.stringify(outputJson, null, 4), (err) => {
    if (err) {
      console.error('Error writing the file:', err);
      return;
    }

    // Record the end time
    const end_time = performance.now();
    const elapsed_time = (end_time - start_time) / 1000; // Convert milliseconds to seconds
    console.log(`The code took ${elapsed_time.toFixed(4)} seconds to run.`);
  });
});
