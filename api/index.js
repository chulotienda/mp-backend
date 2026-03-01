import mercadopago from "mercadopago";

export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { items } = req.body;

  try {
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN
    });

    const preference = {
      items,
      back_urls: {
        success: "https://chulotienda.lovable.app",
        failure: "https://chulotienda.lovable.app",
        pending: "https://chulotienda.lovable.app"
      },
      auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);

    res.status(200).json({ init_point: response.body.init_point });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
