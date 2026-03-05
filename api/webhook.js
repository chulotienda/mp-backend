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

    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      return res.status(200).json({ message: "No payment id" });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    console.log("Status del pago:", paymentData.status);

    if (paymentData.status !== "approved") {
      return res.status(200).json({ message: "Pago no aprobado" });
    }

    const order = JSON.parse(paymentData.external_reference);

    const html = `
    <div style="font-family:Arial;background:#f4f8fb;padding:40px">
      <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px">

        <h2 style="color:#1e73be">Nueva venta en Chulo Tienda</h2>

        <h3>Datos del cliente</h3>

        <p><strong>Nombre:</strong> ${order.customerName}</p>
        <p><strong>DNI:</strong> ${order.customerDni}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Teléfono:</strong> ${order.customerPhone}</p>

        <p><strong>Dirección:</strong> ${order.customerAddress}</p>
        <p><strong>Ciudad:</strong> ${order.customerCity}</p>
        <p><strong>Provincia:</strong> ${order.customerProvince}</p>
        <p><strong>Código Postal:</strong> ${order.customerPostalCode}</p>

        <hr>

        <h3>Detalle de compra</h3>

        ${order.items.map(i => `
          <p>
          ${i.title}  
          Cantidad: ${i.quantity}  
          Precio: $${i.unit_price}
          </p>
        `).join("")}

        <p><strong>Total:</strong> $${order.totalAmount}</p>

        <p><strong>ID de pago:</strong> ${paymentData.id}</p>

      </div>
    </div>
    `;

    await resend.emails.send({
      from: "Chulo Tienda <onboarding@resend.dev>",
      to: "chulotienda26@gmail.com",
      subject: "Nueva venta en Chulo Tienda",
      html: html
    });

    console.log("Email enviado correctamente");

    return res.status(200).json({
      message: "Pago aprobado y email enviado"
    });

  } catch (error) {

    console.error("Error en webhook:", error);

    return res.status(500).json({
      error: "Error interno"
    });

  }

}
