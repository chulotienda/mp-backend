import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { items } = req.body;

  try {
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN
    });

    const preference = {
      items: items,
      back_urls: {
        success: "https://tusitio.com/success",
        failure: "https://tusitio.com/failure",
        pending: "https://tusitio.com/pending"
      },
      auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);

    res.status(200).json({ init_point: response.body.init_point });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
