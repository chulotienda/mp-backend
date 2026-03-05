import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ message: "OK" });
  }

  try {

    console.log("Webhook recibido");
    console.log("Query completa:", req.query);
    console.log("Body completo:", req.body);

    const paymentId = req.body.data.id;

    if (!paymentId) {
      console.log("No payment id");
      return res.status(200).json({ message: "No payment id" });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    console.log("Status del pago:", paymentData.status);

    if (paymentData.status !== "approved") {
      console.log("Pago no aprobado todavía");
      return res.status(200).json({ message: "Pago no aprobado" });
    }

    console.log("Pago aprobado correctamente");

    return res.status(200).json({
      message: "Pago aprobado confirmado"
    });

  } catch (error) {

    console.error("Error en webhook:", error);

    return res.status(500).json({ error: "Error interno" });

  }

}
