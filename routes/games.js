const express = require('express');
const router = express.Router();
const axios = require('axios');
const moment = require('moment');

// GET teams listing.
const getTeams = year => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `http://data.nba.net/10s/prod/v2/${year}/teams.json`;
      const response = await axios.get(url);
      resolve(response.data.league.standard);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};
//   GET Season Schedule Year
const getSeasonScheduleYear = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = 'http://data.nba.net/10s/prod/v4/today.json';
      const response = await axios.get(url);
      resolve(response.data.seasonScheduleYear);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

// GET games listing.
const getGames = date => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `http://data.nba.net/10s/prod/v2/${date.format(
        'YYYYMMDD'
      )}/scoreboard.json`;
      const response = await axios.get(url);
      resolve(response.data.games);
    } catch (e) {
      reject(e);
    }
  });
};

router.get('/', async (req, res, next) => {
  try {
    const year = await getSeasonScheduleYear();
    const teams = await getTeams(year);
    let games = await getGames(moment());
    games = games.map(g => {
      const hTeam = teams.find(t => g.hTeam.teamId == t.teamId);
      const vTeam = teams.find(t => g.vTeam.teamId == t.teamId);

      g.vTeam.fullName = vTeam.fullName;
      g.hTeam.fullName = hTeam.fullName;
      return g;
    });

    res.send(games);
  } catch (e) {
    res.sendStatus(400);
  }
});

module.exports = router;
