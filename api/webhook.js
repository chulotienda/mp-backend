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
    console.log("Query completa:", req.query);
    console.log("Body completo:", req.body);

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

    console.log("Pago aprobado, enviando mails...");

    const buyerEmail = paymentData.payer.email;

    const htmlCliente = `
      <h2>Gracias por tu compra</h2>
      <p>Tu pago fue aprobado correctamente.</p>
      <p>ID de operación: ${paymentData.id}</p>
    `;

    const htmlOwner = `
      <h2>Nueva venta en Chulo Tienda</h2>
      <p>Email del cliente: ${buyerEmail}</p>
      <p>ID de pago: ${paymentData.id}</p>
      <p>Total: ${paymentData.transaction_amount}</p>
    `;

    await resend.emails.send({
      from: "Chulo Tienda <onboarding@resend.dev>",
      to: buyerEmail,
      subject: "Confirmación de compra - Chulo Tienda",
      html: htmlCliente,
    });

    await resend.emails.send({
      from: "Chulo Tienda <onboarding@resend.dev>",
      to: "chulotienda26@gmail.com",
      subject: "Nueva venta en Chulo Tienda",
      html: htmlOwner,
    });

    console.log("Mails enviados");

    return res.status(200).json({ message: "Emails enviados" });

  } catch (error) {

    console.error("Error en webhook:", error);

    return res.status(500).json({ error: "Error interno" });

  }
}
