// Função para calcular suspensos por rodada
function getSuspendedPlayers(matches, currentRound = null) {
    const cardHistory = {};
    matches.forEach(match => {
        if (!match.events) return;
        match.events.forEach(event => {
            if (!cardHistory[event.player]) {
                cardHistory[event.player] = [];
            }
            if (event.type === 'yellow' || event.type === 'red') {
                cardHistory[event.player].push({
                    round: match.round,
                    type: event.type
                });
            }
        });
    });
    const suspended = {};
    Object.entries(cardHistory).forEach(([player, cards]) => {
        const redCard = cards.find(card => card.type === 'red');
        if (redCard) {
            if (currentRound === null || currentRound === redCard.round + 1) {
                suspended[player] = 'Cartão vermelho';
            }
            return;
        }
        let yellowRounds = cards.filter(card => card.type === 'yellow').map(card => card.round);
        yellowRounds.sort((a, b) => a - b);
        for (let i = 0; i < yellowRounds.length - 2; i++) {
            if (yellowRounds[i + 2] - yellowRounds[i] === 2) {
                if (currentRound === null || currentRound === yellowRounds[i + 2] + 1) {
                    suspended[player] = '3 amarelos em 3 jogos seguidos';
                }
                return;
            }
        }
    });
    return suspended;
}

function displaySuspendedPlayers(matches, currentRound = null) {
    const suspended = getSuspendedPlayers(matches, currentRound);
    let container = document.getElementById('suspended-players-list');
    if (!container) {
        container = document.createElement('ul');
        container.id = 'suspended-players-list';
        container.className = 'stats-list';
        const section = document.createElement('section');
        section.className = 'content-section';
        section.innerHTML = '<h2>Suspensos</h2>';
        section.appendChild(container);
        document.querySelector('.sidebar-column').appendChild(section);
    }
    container.innerHTML = Object.entries(suspended).map(([player, reason]) =>
        `<li><strong>${player}</strong>: ${reason}</li>`
    ).join('');
}

function displayMatchesWithSuspension(matches, teams, currentRound) {
    const container = document.getElementById('results-container');
    if (!container) return;
    const getTeamInfo = (id) => teams.find(t => t.id === id);
    const suspended = getSuspendedPlayers(matches, currentRound);
    container.innerHTML = matches.map(match => {
        const homeTeam = getTeamInfo(match.homeTeam);
        const awayTeam = getTeamInfo(match.awayTeam);
        let homePlayers = (match.events || []).filter(e => e.team === homeTeam.id && !suspended[e.player]);
        let awayPlayers = (match.events || []).filter(e => e.team === awayTeam.id && !suspended[e.player]);
        return `
            <div class="match-card">
                <div class="match-round">Rodada ${match.round}</div>
                <div class="match-body">
                    <div class="team">
                        <span class="team-name">${homeTeam.name}</span>
                        <img src="${homeTeam.logo}" alt="${homeTeam.name}" class="team-logo">
                    </div>
                    <div class="match-score">
                        <span>${match.homeScore} x ${match.awayScore}</span>
                    </div>
                    <div class="team away">
                        <img src="${awayTeam.logo}" alt="${awayTeam.name}" class="team-logo">
                        <span class="team-name">${awayTeam.name}</span>
                    </div>
                </div>
                <div class="match-status">
                    <span>Jogadores disponíveis (casa): ${homePlayers.map(e => e.player).join(', ') || 'Todos suspensos'}</span><br>
                    <span>Jogadores disponíveis (fora): ${awayPlayers.map(e => e.player).join(', ') || 'Todos suspensos'}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Substitui chamada padrão para usar lógica de suspensão
document.addEventListener('DOMContentLoaded', () => {
    const standings = createStandings(teamsData, matchesData);
    displayStandings(standings);
    // Rodada atual: exemplo, 2 (pode ser dinâmico)
    const currentRound = 2;
    displayMatchesWithSuspension(matchesData, teamsData, currentRound);
    displaySuspendedPlayers(matchesData, currentRound);
});
// ===================================================================================
// DADOS DO CAMPEONATO - EDITE AQUI
// ===================================================================================

// 1. LISTA DE TIMES
const teamsData = [
    { id: 'hydra', name: 'HYDRA RFC', logo: 'img/hydra_rfc.png' },
    { id: 'aliens', name: 'LOS ALIENS', logo: 'img/los_aliens.png' },
    { id: 'galacticos', name: 'Los Galácticos', logo: 'img/los_galacticos.png' },
    { id: 'revolution', name: 'FC Revolution', logo: 'img/fc_revolution.png' }
    // Adicione mais times aqui
];

// 2. RESULTADOS DOS JOGOS
// Agora cada partida pode ter eventos de jogadores (gols, amarelos, vermelhos)
const matchesData = [
    {
        round: 1,
        homeTeam: 'hydra',
        homeScore: 3,
        awayTeam: 'aliens',
        awayScore: 3,
        events: [
            { team: 'hydra', player: 'PlayerX', type: 'yellow' },
            { team: 'hydra', player: 'PlayerY', type: 'red' },
            { team: 'aliens', player: 'JogadorA', type: 'yellow' },
            { team: 'aliens', player: 'JogadorB', type: 'yellow' }
        ]
    },
    {
        round: 1,
        homeTeam: 'galacticos',
        homeScore: 2,
        awayTeam: 'revolution',
        awayScore: 1,
        events: [
            { team: 'galacticos', player: 'Atleta1', type: 'yellow' },
            { team: 'revolution', player: 'Jogador1', type: 'red' }
        ]
    },
    {
        round: 2,
        homeTeam: 'hydra',
        homeScore: 1,
        awayTeam: 'galacticos',
        awayScore: 2,
        events: [
            { team: 'hydra', player: 'PlayerX', type: 'yellow' },
            { team: 'galacticos', player: 'Atleta2', type: 'yellow' }
        ]
    },
    {
        round: 2,
        homeTeam: 'aliens',
        homeScore: 4,
        awayTeam: 'revolution',
        awayScore: 2,
        events: [
            { team: 'aliens', player: 'JogadorA', type: 'yellow' },
            { team: 'revolution', player: 'Jogador2', type: 'yellow' }
        ]
    }
    // Adicione mais partidas aqui
];

// ===================================================================================
// LÓGICA DO SITE - NÃO PRECISA EDITAR ABAIXO
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    const standings = createStandings(teamsData, matchesData);
    displayStandings(standings);
    displayMatches(matchesData, teamsData);
    displaySuspendedPlayers(matchesData);
});

/**
 * Calcula a tabela de classificação com base nos times e resultados.
 */
function createStandings(teams, matches) {
    const standings = teams.map(team => ({
        ...team,
        points: 0,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
    }));

    const getTeam = (id) => standings.find(t => t.id === id);

    matches.forEach(match => {
        const homeTeam = getTeam(match.homeTeam);
        const awayTeam = getTeam(match.awayTeam);
        if (!homeTeam || !awayTeam) return;
        homeTeam.played++;
        awayTeam.played++;
        homeTeam.goalsFor += match.homeScore;
        awayTeam.goalsFor += match.awayScore;
        homeTeam.goalsAgainst += match.awayScore;
        awayTeam.goalsAgainst += match.homeScore;
        homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
        awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;
        if (match.homeScore > match.awayScore) {
            homeTeam.points += 3;
            homeTeam.wins++;
            awayTeam.losses++;
        } else if (match.homeScore < match.awayScore) {
            awayTeam.points += 3;
            awayTeam.wins++;
            homeTeam.losses++;
        } else {
            homeTeam.points += 1;
            awayTeam.points += 1;
            homeTeam.draws++;
            awayTeam.draws++;
        }
    });
    standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.name.localeCompare(b.name);
    });
    return standings;
}

/**
 * Calcula jogadores suspensos por cartões
 */
function getSuspendedPlayers(matches) {
    // Histórico de cartões por jogador
    const cardHistory = {};
    matches.forEach(match => {
        if (!match.events) return;
        match.events.forEach(event => {
            if (!cardHistory[event.player]) {
                cardHistory[event.player] = [];
            }
            if (event.type === 'yellow' || event.type === 'red') {
                cardHistory[event.player].push({
                    round: match.round,
                    type: event.type
                });
            }
        });
    });
    // Verifica suspensões
    const suspended = {};
    Object.entries(cardHistory).forEach(([player, cards]) => {
        // Suspenso por vermelho
        if (cards.some(card => card.type === 'red')) {
            suspended[player] = 'Cartão vermelho';
            return;
        }
        // Suspenso por 3 amarelos em 3 jogos seguidos
        let yellowRounds = cards.filter(card => card.type === 'yellow').map(card => card.round);
        yellowRounds.sort((a, b) => a - b);
        for (let i = 0; i < yellowRounds.length - 2; i++) {
            if (yellowRounds[i + 2] - yellowRounds[i] === 2) {
                suspended[player] = '3 amarelos em 3 jogos seguidos';
                return;
            }
        }
    });
    return suspended;
}

/**
 * Exibe jogadores suspensos na interface
 */
function displaySuspendedPlayers(matches) {
    const suspended = getSuspendedPlayers(matches);
    let container = document.getElementById('suspended-players-list');
    if (!container) {
        // Cria a seção se não existir
        container = document.createElement('ul');
        container.id = 'suspended-players-list';
        container.className = 'stats-list';
        const section = document.createElement('section');
        section.className = 'content-section';
        section.innerHTML = '<h2>Suspensos</h2>';
        section.appendChild(container);
        document.querySelector('.sidebar-column').appendChild(section);
    }
    container.innerHTML = Object.entries(suspended).map(([player, reason]) =>
        `<li><strong>${player}</strong>: ${reason}</li>`
    ).join('');
}

/**
 * Exibe a tabela de classificação na página.
 */
function displayStandings(standings) {
    const tableBody = document.getElementById('standings-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = standings.map((team, index) => `
        <tr>
            <td class="pos-col">${index + 1}</td>
            <td class="team-col">
                <div class="team-info">
                    <img src="${team.logo}" alt="Logo ${team.name}" class="team-logo">
                    <span>${team.name}</span>
                </div>
            </td>
            <td>${team.points}</td>
            <td>${team.wins}</td>
            <td>${team.draws}</td>
            <td>${team.losses}</td>
            <td>${team.goalsFor}</td>
            <td>${team.goalsAgainst}</td>
            <td>${team.goalDifference}</td>
        </tr>
    `).join('');
}

/**
 * Exibe os resultados dos jogos em cards.
 */
function displayMatches(matches, teams) {
    const container = document.getElementById('results-container');
    if (!container) return;

    const getTeamInfo = (id) => teams.find(t => t.id === id);

    container.innerHTML = matches.map(match => {
        const homeTeam = getTeamInfo(match.homeTeam);
        const awayTeam = getTeamInfo(match.awayTeam);

        return `
            <div class="match-card">
                <div class="match-round">Rodada ${match.round}</div>
                <div class="match-body">
                    <div class="team">
                        <span class="team-name">${homeTeam.name}</span>
                        <img src="${homeTeam.logo}" alt="${homeTeam.name}" class="team-logo">
                    </div>
                    <div class="match-score">
                        <span>${match.homeScore} x ${match.awayScore}</span>
                    </div>
                    <div class="team away">
                        <img src="${awayTeam.logo}" alt="${awayTeam.name}" class="team-logo">
                        <span class="team-name">${awayTeam.name}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}