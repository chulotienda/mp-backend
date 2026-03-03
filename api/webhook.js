import { MercadoPagoConfig, Payment } from "mercadopago";
import { Resend } from "resend";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, data } = req.body;

    if (type !== "payment") {
      return res.status(200).json({ received: true });
    }

    const payment = new Payment(mpClient);
    const paymentData = await payment.get({ id: data.id });

    if (paymentData.status !== "approved") {
      return res.status(200).json({ status: "ignored" });
    }

    const payer = paymentData.payer;
    const item = paymentData.additional_info?.items?.[0];

    const logoUrl =
      "https://raw.githubusercontent.com/chulotienda/mp-backend/main/logo-chulo.png";

    const customerName = payer.first_name + " " + payer.last_name;
    const customerEmail = payer.email;
    const customerDni = payer.identification?.number || "No informado";

    const productTitle = item?.title || "Producto";
    const quantity = item?.quantity || 1;
    const totalAmount = paymentData.transaction_amount;
    const paymentId = paymentData.id;

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color:#f4f8fb; padding:40px;">
        <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px;">
          
          <div style="text-align:center; margin-bottom:30px;">
            <img src="${logoUrl}" alt="Chulo Tienda" style="max-width:200px;" />
          </div>

          <h2 style="color:#1e73be;">¡Gracias por tu compra!</h2>

          <p>Hola <strong>${customerName}</strong>,</p>
          
          <p>
            Recibimos tu pago correctamente. Estamos preparando tu pedido.
          </p>

          <hr style="margin:25px 0;" />

          <h3 style="color:#1e73be;">Detalle de tu compra</h3>

          <p><strong>Producto:</strong> ${productTitle}</p>
          <p><strong>Cantidad:</strong> ${quantity}</p>
          <p><strong>Total abonado:</strong> $${totalAmount}</p>
          <p><strong>ID de pago:</strong> ${paymentId}</p>

          <hr style="margin:25px 0;" />

          <p style="color:#1e73be; font-weight:bold;">
            Chulo Tienda
          </p>

        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Chulo Tienda <chulotienda26@gmail.com>",
      to: customerEmail,
      subject: "Confirmación de compra - Chulo Tienda",
      html: htmlTemplate,
    });

    await resend.emails.send({
      from: "Chulo Tienda <chulotienda26@gmail.com>",
      to: "chulotienda26@gmail.com",
      subject: "Nueva venta en Chulo Tienda",
      html: htmlTemplate,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Webhook error" });
  }
}
