const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// Get States API 1

app.get("/states/", async (request, response) => {
  const getStateQuery = `
    SELECT 
        state_id AS stateId,
        state_name AS stateName,
        population
    FROM 
        state;`;
  const dbResponse = await db.all(getStateQuery);
  response.send(dbResponse);
});

// Get a State based on id API 2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT 
        state_id AS stateId,
        state_name AS stateName,
        population 
    FROM 
        state WHERE state_id = ${stateId};`;
  const dbResponse = await db.get(getStateQuery);
  response.send(dbResponse);
});

// Create a new District in district table API 3

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const addDistrictquery = `
    INSERT INTO 
    district (district_name,state_id,cases,cured,active ,deaths )
    VALUES ('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const dbResponse = await db.run(addDistrictquery);
  response.send("District Successfully Added");
});

// Get a district based on id API 4

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT 
        district_id AS districtId,
        district_name AS districtName,
        state_id AS stateId,
        cases,
        cured,
        active,
        deaths 
    FROM 
        district WHERE district_id = ${districtId};`;
  const dbResponse = await db.get(getDistrictQuery);
  response.send(dbResponse);
});

//delete movie name based on movieId API 5

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    delete from  district where district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//Updates the details of a specific district based on the district ID API 6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const { districtId } = request.params;
  const updateDistrictQuery = `
  UPDATE
    district
  SET
    district_name = "${districtName}",
    state_id=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
  WHERE
    district_id = ${districtId};`;

  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//Returns the statistics of total cases, cured, active,
//deaths of a specific state based on state ID API 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsQuery = `
    SELECT 
        sum(cases) as totalCases,
        sum(cured) as totalCured,
        sum(active) as totalActive,
        sum(deaths) as totalDeaths
    FROM 
        district WHERE state_id = ${stateId};`;
  const dbResponse = await db.get(getStatsQuery);
  response.send(dbResponse);
});

//Returns an object containing the state name of a district
// based on the district ID API 8

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateQuery = `
    SELECT 
        state_name as stateName
    FROM 
        state 
    natural join district
    WHERE 
        district_id = ${districtId};`;
  const dbResponse = await db.get(getStateQuery);
  response.send(dbResponse);
});

module.exports = app;
