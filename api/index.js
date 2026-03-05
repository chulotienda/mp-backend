import { MercadoPagoConfig, Preference } from "mercadopago";

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {

    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      customerProvince,
      customerPostalCode,
      customerDni,
      totalAmount
    } = req.body;

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN
    });

    const preference = new Preference(client);

    const response = await preference.create({
      body: {

        items,

        external_reference: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          customerCity,
          customerProvince,
          customerPostalCode,
          customerDni,
          totalAmount
        }),

        back_urls: {
          success: "https://chulotienda.lovable.app/success",
          failure: "https://chulotienda.lovable.app/failure",
          pending: "https://chulotienda.lovable.app/pending"
        },

        auto_return: "approved"

      }
    });

    res.status(200).json({
      init_point: response.init_point
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }
}
