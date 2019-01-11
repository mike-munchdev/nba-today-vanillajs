document.addEventListener('DOMContentLoaded', documentLoad);

const httpErrorHandler = e => {
  displayError('Error connecting to the server');
};

function documentLoad() {
  const elLoading = document.createElement('div');
  elLoading.id = 'loading';
  elLoading.className = 'col-12 col-md-8 mx-auto text-center';

  const elLoadingSpinner = document.createElement('i');
  elLoadingSpinner.className = 'fa fa-spinner fa-3x fa-spin';

  elLoading.appendChild(elLoadingSpinner);
  document.body.appendChild(elLoading);
  displayScores(new Date());
}

function displayError(text) {
  const prevAlert = document.querySelector('#alert');
  if (prevAlert) {
    document.body.removeChild(prevAlert);
  }
  const elAlert = document.createElement('div');
  elAlert.className = 'alert alert-danger col-12 col-md-6 mx-auto';
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
      break;
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
  elTeamImgDiv.className = 'col-2';

  const elTeamImg = document.createElement('img');
  elTeamImg.src = 'assets/' + team.triCode + '.png';
  elTeamImg.width = 30;
  elTeamImg.height = 30;
  elTeamImg.className = 'float-right';

  elTeamImgDiv.appendChild(elTeamImg);

  rowEl.appendChild(elTeamImgDiv);

  const elTeamName = document.createElement('div');
  elTeamName.className = 'col-7';

  const elTeamNameText = document.createElement('span');
  elTeamNameText.innerHTML = team.fullName;
  elTeamNameText.className = 'team-name text-center h-100';
  elTeamName.appendChild(elTeamNameText);

  rowEl.appendChild(elTeamName);

  const elScore = document.createElement('div');
  elScore.className = 'col-3 text-right';
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

function createGameHeader(headingText) {
  const row = document.createElement('div');
  row.className = 'row';

  const headingRow = document.createElement('div');
  headingRow.className = 'col-12 mx-auto';

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
  headingRow.className = 'col-12 mx-auto';

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

function displayScores(date) {
  // https://stackoverflow.com/a/3067896
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const gameDate = [
    date.getFullYear(),
    (month > 9 ? '' : '0') + month,
    (day > 9 ? '' : '0') + day
  ].join('');

  let xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/v1/games/' + gameDate);
  xhr.onload = function() {
    document.querySelector('#loading').className = 'hidden';
    if (this.status == 200) {
      let response = JSON.parse(this.responseText);
      if (response.length != 0) {
        // add full name to home and visting teams

        const containerObj = document.querySelector('.container');
        const row = document.createElement('div');
        row.className = 'row';

        const offsetCol = document.createElement('div');
        offsetCol.className =
          'col-xs-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3';

        const liveGames = response.filter(g => g.statusNum === 2);
        if (liveGames.length > 0) {
          offsetCol.append(createGamesListing('Live', liveGames));
        }

        const upcomingGames = response.filter(g => g.statusNum === 1);
        if (upcomingGames.length > 0) {
          offsetCol.append(createGamesListing('Upcoming', upcomingGames));
        }

        const finishedGames = response.filter(g => g.statusNum === 3);
        if (finishedGames.length > 0) {
          offsetCol.append(createGamesListing('Finished', finishedGames));
        }
        row.appendChild(offsetCol);
        containerObj.appendChild(row);
      }
    } else {
      displayError('error found');
    }
  };

  xhr.onerror = httpErrorHandler;

  xhr.send();
}
