import { MercadoPagoConfig, Payment } from "mercadopago";
import { Resend } from "resend";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "OK" });
  }

  try {
    console.log("Webhook recibido");

    const paymentId = req.query["data.id"];

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

    console.log("Enviando mail...");

    await resend.emails.send({
      from: "Chulo Tienda <onboarding@resend.dev>",
      to: paymentData.payer.email,
      subject: "Tu compra fue aprobada 🎉",
      html: `
        <h2>Gracias por tu compra</h2>
        <p>Tu pago fue aprobado correctamente.</p>
        <p>ID de operación: ${paymentData.id}</p>
      `,
    });

    console.log("Mail enviado");

    return res.status(200).json({ message: "Mail enviado" });

  } catch (error) {
    console.error("Error en webhook:", error);
    return res.status(500).json({ error: "Error interno" });
  }
}
