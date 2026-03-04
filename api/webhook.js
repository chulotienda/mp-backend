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

    console.log("Pago aprobado, enviando emails...");

    await fetch("https://mp-backend-alpha.vercel.app/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerName: paymentData.payer.first_name || "Cliente",
        customerEmail: paymentData.payer.email,
        customerPhone: paymentData.payer.phone?.number || "",
        customerAddress: "",
        customerCity: "",
        customerProvince: "",
        customerDni: "",
        productTitle: "Compra en Chulo Tienda",
        productPrice: paymentData.transaction_amount,
        quantity: 1,
        totalAmount: paymentData.transaction_amount,
        paymentId: paymentData.id
      }),
    });

    console.log("Emails enviados");

    return res.status(200).json({ message: "OK" });

  } catch (error) {

    console.error("Error en webhook:", error);

    return res.status(500).json({
      error: "Error interno",
    });

  }
}
