// POST /api/submit  { prenom, reussites: [true,false,...] }
function cleDe(prenom) {
  return prenom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  const prenom = String(data.prenom || "").trim();
  if (prenom.length < 2 || prenom.length > 30) {
    return Response.json({ erreur: "Le prénom doit faire entre 2 et 30 caractères." }, { status: 400 });
  }

  const reussites = Array.isArray(data.reussites) ? data.reussites.map(Boolean) : null;
  if (!reussites || reussites.length < 1 || reussites.length > 100) {
    return Response.json({ erreur: "Réponses invalides." }, { status: 400 });
  }

  const total = reussites.length;
  const score = reussites.filter(Boolean).length;

  try {
    await env.DB
      .prepare("INSERT INTO participants (prenom, prenom_cle, score, total, reussites) VALUES (?, ?, ?, ?, ?)")
      .bind(prenom, cleDe(prenom), score, total, JSON.stringify(reussites))
      .run();
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) {
      return Response.json({ erreur: "Ce prénom a déjà participé." }, { status: 409 });
    }
    return Response.json({ erreur: "Erreur serveur." }, { status: 500 });
  }

  return Response.json({ ok: true, score, total });
}
