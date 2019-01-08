document.addEventListener('DOMContentLoaded', documentLoad);

const httpErrorHandler = e => {
  displayError('Error connecting to the server');
};

function documentLoad() {
  const elLoading = document.createElement('div');
  elLoading.id = 'loading';
  elLoading.className = 'col-md-5 mx-auto text-center';

  const elLoadingSpinner = document.createElement('i');
  elLoadingSpinner.className = 'fa fa-spinner fa-3x fa-spin';

  elLoading.appendChild(elLoadingSpinner);
  document.body.appendChild(elLoading);

  getTeams();
}

function displayError(text) {
  const prevAlert = document.querySelector('#alert');
  if (prevAlert) {
    document.body.removeChild(prevAlert);
  }
  const elAlert = document.createElement('div');
  elAlert.className = 'alert alert-danger col-md-5 mx-auto';
  elAlert.id = 'alert';
  elAlert.role = 'alert';

  document.querySelector('#loading').className = 'hidden';

  elAlert.innerHTML = text;
  document.body.appendChild(elAlert);
}

function getNumberWithOrdinal(n) {
  switch (n) {
  case 1:
    return '1st';
  case 2:
    return '2nd';
  case 3:
    return '3rd';
  case 4:
    return '4th';
  default:
    return 'OT';
  }
}

function getScore(game, team) {
  const elScore = document.createElement('span');

  if (game.period.current === 0) {
    elScore.className = 'team-record';
    elScore.innerHTML = '' + team.win + ' - ' + team.loss;
  } else {
    elScore.className = 'team-score';
    elScore.innerHTML = team.score;
  }
  return elScore;
}

function getGameStart(game) {
  const startTime = new Date(game.startTimeUTC);
  const headerDiv = document.createElement('div');
  headerDiv.classList.add('game-time');
  headerDiv.classList.add('text-right');

  if (game.period.isHalftime === true) {
    headerDiv.classList.add('font-weight-bold');
    headerDiv.innerHTML = 'Half';
  } else if (game.period.current === 0) {
    headerDiv.classList.add('text-muted');
    headerDiv.innerHTML = startTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } else {
    switch (game.statusNum) {
    case 2:
      if (game.period.isEndOfPeriod) {
        headerDiv.innerHTML =
            'End of ' + getNumberWithOrdinal(game.period.current);
      } else {
        headerDiv.innerHTML =
            '' + game.clock + ' ' + getNumberWithOrdinal(game.period.current);
      }
    case 3:
      headerDiv.classList.add('text-muted');
      headerDiv.classList.add('font-weight-bold');
      headerDiv.innerHTML = 'Final';
    }
  }

  return headerDiv;
}

function getTeamLine(game, team) {
  const rowEl = document.createElement('div');
  rowEl.className = 'row team-row';

  const elTeamImgDiv = document.createElement('div');
  elTeamImgDiv.className = 'col-md-2';

  const elTeamImg = document.createElement('img');
  elTeamImg.src = 'assets/' + team.triCode + '.png';
  elTeamImg.width = 30;
  elTeamImg.height = 30;
  elTeamImg.className = 'float-right';

  elTeamImgDiv.appendChild(elTeamImg);

  rowEl.appendChild(elTeamImgDiv);

  const elTeamName = document.createElement('div');
  elTeamName.className = 'col-md-7';

  const elTeamNameText = document.createElement('span');
  elTeamNameText.innerHTML = team.fullName;
  elTeamNameText.className = 'team-name text-center h-100';
  elTeamName.appendChild(elTeamNameText);

  rowEl.appendChild(elTeamName);

  const elScore = document.createElement('div');
  elScore.className = 'col-md-3 text-right';
  elScore.appendChild(getScore(game, team));

  rowEl.appendChild(elScore);

  return rowEl;
}

function addGameListItem(game) {
  const li = document.createElement('li');

  li.className = 'list-group-item game';
  li.appendChild(getGameStart(game));
  li.appendChild(getTeamLine(game, game.vTeam));
  li.appendChild(getTeamLine(game, game.hTeam));

  return li;
}

function getTeams() {
  const nbaTeams = JSON.parse(sessionStorage.getItem('nba-teams'));
  if (nbaTeams) {
    displayScores({ teams: nbaTeams });
  } else {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:5000/api/v1/teams');
    
    xhr.onload = function() {
      if (this.status == 200) {
    
        let response = JSON.parse(this.responseText);
        const teams = response.filter(t => t.isNBAFranchise === true);
        sessionStorage.setItem('nba-teams', JSON.stringify(teams));
        displayScores({ teams });
      }
    };

    xhr.onerror = httpErrorHandler;
    xhr.send();
  }
}

function createGameHeader(headingText) {
  const row = document.createElement('div');
  row.className = 'row';

  const headingRow = document.createElement('div');
  headingRow.className = 'col-md-5 mx-auto';

  const heading = document.createElement('h2');
  heading.className = 'list-title';
  heading.innerHTML = headingText;

  headingRow.appendChild(heading);
  row.appendChild(headingRow);
  return row;
}

function createScoreList(games) {
  const row = document.createElement('div');
  row.className = 'row';

  const headingRow = document.createElement('div');
  headingRow.className = 'col-md-5 mx-auto';

  const ulGames = document.createElement('ul');
  ulGames.className = 'list-group';

  games.forEach(game => {
    ulGames.appendChild(addGameListItem(game));
  });

  headingRow.appendChild(ulGames);
  row.appendChild(headingRow);
  return row;
}

function createGamesListing(headerText, games) {
  const gamesListObj = document.createElement('div');
  gamesListObj.className = 'game-listing';
  const gamesHeaderObj = createGameHeader(headerText);
  gamesListObj.appendChild(gamesHeaderObj);

  const scoresListObj = createScoreList(games);
  gamesListObj.appendChild(scoresListObj);

  return gamesListObj;
}

function displayScores({ teams, date }) {
  let gameDate = date;
  let nbaTeams = teams;
  if (!gameDate) {
    // gameDate = moment().format("YYYYMMDD");
    gameDate = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
  }
  if (!nbaTeams) {
    nbaTeams = JSON.parse(sessionStorage.getItem('nba-teams'));
  }
  let xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:5000/api/v1/games');  
  xhr.onload = function() {
    document.querySelector('#loading').className = 'hidden';
    if (this.status == 200) {
      let response = JSON.parse(this.responseText);
      if (response.length != 0) {
        // add full name to home and visting teams
        const games = response.map(g => {
          const hTeam = nbaTeams.find(t => g.hTeam.teamId == t.teamId);
          const vTeam = nbaTeams.find(t => g.vTeam.teamId == t.teamId);

          g.vTeam.fullName = vTeam.fullName;
          g.hTeam.fullName = hTeam.fullName;
          return g;
        });
        const containerObj = document.querySelector('.container');

        const upcomingGames = games.filter(g => g.statusNum === 1);
        if (upcomingGames.length > 0) {
          containerObj.append(createGamesListing('Upcoming', upcomingGames));
        }
        const liveGames = games.filter(g => g.statusNum === 2);
        if (liveGames.length > 0) {
          containerObj.append(createGamesListing('Live', liveGames));
        }

        const finishedGames = games.filter(g => g.statusNum === 3);
        if (finishedGames.length > 0) {
          containerObj.append(createGamesListing('Finished', finishedGames));
        }
      }
    } else {      
      displayError('error found');
    }
  };

  xhr.onerror = httpErrorHandler;

  xhr.send();
}
