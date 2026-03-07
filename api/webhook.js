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
    console.log("Query:", req.query);
    console.log("Body:", req.body);

    const paymentId = req.body?.data?.id;

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

    // recuperar datos del cliente desde metadata
    const customerData = paymentData.metadata || {};

    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      customerProvince,
      customerPostalCode,
      customerDni,
      totalAmount
    } = customerData;

    const productTitle =
      paymentData.additional_info?.items?.[0]?.title || "Producto";

    const quantity =
      paymentData.additional_info?.items?.[0]?.quantity || 1;

    // enviar email
    await fetch("https://mp-backend-alpha.vercel.app/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        customerCity,
        customerProvince,
        customerPostalCode,
        customerDni,
        productTitle,
        quantity,
        totalAmount,
        paymentId
      }),
    });

    return res.status(200).json({
      message: "Pago aprobado y email enviado",
    });

  } catch (error) {

    console.error("Error en webhook:", error);

    return res.status(500).json({
      error: "Error interno",
    });

  }
}
