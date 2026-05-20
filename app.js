// =========================
// GLOBAL STATE
// =========================
let allTeams = [];

// =========================
// CLUB NET WORTH DATABASE (ALL 20 TEAMS)
// =========================
const clubNetWorth = {
  "Arsenal": "£2.2B",
  "Chelsea": "£2.0B",
  "Liverpool": "£2.8B",
  "Manchester City": "£4.0B",
  "Manchester United": "£3.5B",
  "Tottenham Hotspur": "£2.3B",
  "Newcastle United": "£1.1B",
  "West Ham United": "£0.9B",
  "Everton": "£0.6B",
  "Aston Villa": "£0.8B",
  "Brighton & Hove Albion": "£0.7B",
  "Brentford": "£0.5B",
  "Crystal Palace": "£0.55B",
  "Wolverhampton Wanderers": "£0.65B",
  "Fulham": "£0.45B",
  "Nottingham Forest": "£0.5B",
  "Bournemouth": "£0.4B",
  "Leicester City": "£0.75B",
  "Burnley": "£0.35B",
  "Leeds United": "£0.3B"
};

// =========================
// LOAD TEAMS
// =========================
async function loadTeams() {
  const loading = document.getElementById("loading");
  loading.classList.remove("hidden");

  try {
    const res = await fetch("https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=English Premier League");
    const data = await res.json();

    allTeams = data?.teams || [];

    if (!allTeams.length) {
      document.getElementById("output").innerHTML = "<h3>No teams found</h3>";
      return;
    }

    displayTeams(allTeams);
  } catch (err) {
    console.log(err);
    document.getElementById("output").innerHTML = "<h3>Failed to load teams</h3>";
  }

  loading.classList.add("hidden");
}

// =========================
// DISPLAY TEAMS
// =========================
function displayTeams(teams) {
  const output = document.getElementById("output");

  output.innerHTML = teams.map(team => {
    const logo = team.strBadge || team.strLogo || "https://via.placeholder.com/80?text=No+Logo";

    return `
      <div class="card" data-id="${team.idTeam}">
        <img src="${logo}" width="80">
        <h3>${team.strTeam}</h3>
        <p>${team.strStadium || "No stadium info"}</p>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => showTeam(card.dataset.id));
  });
}

// =========================
// SHOW TEAM FULL PAGE
// =========================
function showTeam(id) {
  const team = allTeams.find(t => String(t.idTeam) === String(id));
  if (!team) return;

  const logo = team.strBadge || team.strLogo || "https://via.placeholder.com/120?text=No+Logo";

  const netWorth = clubNetWorth[team.strTeam] || "Not Available";

  const output = document.getElementById("output");

  output.innerHTML = `
    <div style="min-height:100vh; padding:20px; box-sizing:border-box;">

      <div style="position:sticky; top:0; background:#fff; display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #ddd;">
        <h2>${team.strTeam}</h2>
        <button onclick="backToTeams()">⬅ Back</button>
      </div>

      <div style="text-align:center; max-width:900px; margin:auto;">
        <img src="${logo}" width="150">

        <p><strong>Stadium:</strong> ${team.strStadium || "N/A"}</p>
        <p><strong>Location:</strong> ${team.strLocation || "N/A"}</p>
        <p><strong>Country:</strong> ${team.strCountry || "N/A"}</p>
        <p><strong>Founded:</strong> ${team.intFormedYear || "N/A"}</p>
        <p><strong>Manager:</strong> ${team.strManager || "Unknown"}</p>
        <p><strong>Net Worth:</strong> ${netWorth}</p>

        <hr>

        <h3>About Club</h3>
        <p style="text-align:justify; line-height:1.6;">
          ${team.strDescriptionEN || "No description available"}
        </p>

        <hr>

        <h3>Player Squad</h3>
        <div id="squad">Loading squad...</div>
      </div>
    </div>
  `;

  loadSquad(team.idTeam);
}

function backToTeams() {
  displayTeams(allTeams);
}

// =========================
// SEARCH TEAM
// =========================
function searchTeam() {
  const value = document.getElementById("search").value.toLowerCase();

  const filtered = allTeams.filter(team =>
    team.strTeam && team.strTeam.toLowerCase().includes(value)
  );

  displayTeams(filtered.length ? filtered : []);
}

// =========================
// LOAD STANDINGS
// =========================
async function loadStandings() {
  const loading = document.getElementById("loading");
  loading.classList.remove("hidden");

  try {
    const res = await fetch("https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4328");
    const data = await res.json();

    if (!data?.table) {
      document.getElementById("output").innerHTML = "<h3>Standings not available</h3>";
      return;
    }

    displayStandings(data.table);
  } catch (err) {
    console.log(err);
    document.getElementById("output").innerHTML = "<h3>Failed to load standings</h3>";
  }

  loading.classList.add("hidden");
}

// =========================
// DISPLAY STANDINGS
// =========================
function displayStandings(teams) {
  const output = document.getElementById("output");

  output.innerHTML = `
    <table border="1" width="100%" cellpadding="10">
      <tr>
        <th>Rank</th><th>Team</th><th>Logo</th><th>Points</th><th>Wins</th><th>Losses</th>
      </tr>
      ${teams.map(team => {
        const matched = allTeams.find(t =>
          t.strTeam?.toLowerCase().includes(team.name?.toLowerCase())
        );

        const logo = matched?.strBadge || matched?.strLogo || "https://via.placeholder.com/40";

        return `
          <tr>
            <td>${team.intRank || "-"}</td>
            <td>${team.name}</td>
            <td><img src="${logo}" width="40"></td>
            <td>${team.intPoints || "-"}</td>
            <td>${team.intWin || "-"}</td>
            <td>${team.intLoss || "-"}</td>
          </tr>
        `;
      }).join("")}
    </table>
  `;
}

// =========================
// FIXED LOAD SQUAD (NO STUCK)
// =========================
async function loadSquad(teamId) {
  const squadDiv = document.getElementById("squad");

  squadDiv.innerHTML = "Loading squad...";

  try {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookup_all_players.php?id=${teamId}`);
    const data = await res.json();

    const players = data?.player || [];

    if (!players.length) {
      squadDiv.innerHTML = "⚠ No squad data available";
      return;
    }

    squadDiv.innerHTML = players.map(p => `
      <div style="display:flex; gap:10px; padding:8px; border:1px solid #ddd; margin:5px 0; border-radius:8px;">
        <img src="${p.strCutout || p.strThumb || 'https://via.placeholder.com/60'}" width="50">
        <div>
          <strong>${p.strPlayer}</strong><br>
          <small>${p.strPosition || "Unknown"}</small>
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.log(err);
    squadDiv.innerHTML = "❌ Failed to load squad";
  }
}

// =========================
// DARK MODE
// =========================
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// =========================
// AUTO UPDATE
// =========================
setInterval(loadTeams, 300000);
setInterval(loadStandings, 300000);

// =========================
// INIT
// =========================
loadTeams();
