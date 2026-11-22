// GET /api/stats  ->  données du dashboard
export async function onRequestGet({ env }) {
  const { results } = await env.DB
    .prepare("SELECT prenom, score, total, reussites, cree_le FROM participants ORDER BY score DESC, cree_le ASC")
    .all();

  const participants = results.length;
  const total = results.reduce((max, r) => Math.max(max, r.total), 0);

  const distribution = Array(total + 1).fill(0);
  const bonnes = Array(total).fill(0);
  const vues = Array(total).fill(0);
  let somme = 0;

  for (const r of results) {
    somme += r.score;
    if (r.score <= total) distribution[r.score]++;
    let rep = [];
    try { rep = JSON.parse(r.reussites); } catch {}
    rep.forEach((ok, i) => {
      if (i < total) { vues[i]++; if (ok) bonnes[i]++; }
    });
  }

  return Response.json({
    participants,
    total,
    moyenne: participants ? somme / participants : 0,
    meilleur: participants ? results[0].score : 0,
    distribution,
    parQuestion: bonnes.map((b, i) => (vues[i] ? Math.round((b / vues[i]) * 100) : 0)),
    classement: results.map(r => ({ prenom: r.prenom, score: r.score, total: r.total, date: r.cree_le }))
  });
}
