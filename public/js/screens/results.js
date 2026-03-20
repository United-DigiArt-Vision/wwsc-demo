/**
 * WWSC — Results Screen (placeholder)
 * Will show times, record breakers, and pointscore.
 */
async function renderResults() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="screen">
      <h2>🏆 Results</h2>
      <p class="subtitle">Times, Record Breakers & Pointscore</p>
      <div class="placeholder-card">
        <p>Results tracking coming soon!</p>
        <p>This screen will show:</p>
        <ul style="text-align:left; margin:1rem auto; max-width:300px;">
          <li>Heat times & finishing positions</li>
          <li>Record breakers highlighted</li>
          <li>Season pointscore leaderboard</li>
        </ul>
      </div>
    </div>`;
}
