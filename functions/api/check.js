// GET /api/check?prenom=Lea  ->  { existe: true/false }
function cleDe(prenom) {
  return prenom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export async function onRequestGet({ request, env }) {
  const prenom = new URL(request.url).searchParams.get("prenom") || "";
  const ligne = await env.DB
    .prepare("SELECT 1 FROM participants WHERE prenom_cle = ?")
    .bind(cleDe(prenom))
    .first();
  return Response.json({ existe: !!ligne });
}
