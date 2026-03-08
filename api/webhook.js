import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ message: "OK" });
  }

  try {

    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      return res.status(200).json({ message: "No payment id" });
    }

    const payment = new Payment(client);

    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status !== "approved") {
      return res.status(200).json({ message: "Pago no aprobado" });
    }

    const metadata = paymentData.metadata || {};

    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      customerProvince,
      customerPostalCode,
      customerDni,
      totalAmount,
      items
    } = metadata;

    const products = (items || []).map(item => ({
      title: item.title || "Producto",
      quantity: item.quantity || 1,
      price: item.unit_price || 0
    }));

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
        products,
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
