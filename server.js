import express from "express";
import cors from "cors";
import csvToJson from "csvtojson";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    credentials: true,
  })
);

app.get("/api/download", async (req, res) => {
  try {
    const jsonArray = await csvToJson().fromFile(
      "./tableau_scheduler_data.csv"
    );
    const resourceNames = [...new Set(jsonArray.map((item) => item.Assigned))];
    const resourcesRows = resourceNames.map((name, i) => {
      return {
        id: i,
        name,
      };
    });

    const eventsRows = jsonArray.map((item, i) => {
      const resource = resourcesRows.find(
        (resource) => resource.name === item.Assigned
      );
      return {
        id: i,
        name: item.Project,
        startDate: new Date(item.Draft).toISOString(),
        endDate: new Date(item["Publish Date"]).toISOString(),
        resourceId: resource.id,
        duration: parseFloat(item["Duration of Project"]),
        durationUnit: "days",
        due: new Date(item.Due).toISOString(),
      };
    });

    const schedulerLoadResponse = {
      success: true,
      events: {
        rows: eventsRows,
      },
      resources: {
        rows: resourcesRows,
      },
    };

    res.json(schedulerLoadResponse);
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).send("An error occurred while processing the request.");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});