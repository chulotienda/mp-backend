import { Resend } from "resend";
import { MercadoPagoConfig, Payment } from "mercadopago";

const resend = new Resend(process.env.RESEND_API_KEY);

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { payment_id } = req.body;

    if (!payment_id) {
      return res.status(400).json({ error: "payment_id requerido" });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: payment_id });

    const metadata = paymentData.metadata || {};
    const items = paymentData.additional_info?.items || [];

    const products = items.map(item => ({
      title: item.title,
      quantity: item.quantity,
      price: item.unit_price
    }));

    const productRows = products.map(product => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${product.title}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${product.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${product.price}</td>
      </tr>
    `).join("");

    const logoUrl = "https://raw.githubusercontent.com/chulotienda/mp-backend/main/logo-chulo.png";

    const ownerTemplate = `
      <div style="font-family: Arial, sans-serif; background:#f4f8fb; padding:40px;">
        <div style="max-width:700px;margin:auto;background:white;padding:30px;border-radius:10px;">

          <div style="text-align:center;margin-bottom:30px;">
            <img src="${logoUrl}" style="max-width:200px;">
          </div>

          <h2 style="color:#1e73be;">Nueva venta realizada</h2>

          <p><strong>Cliente:</strong> ${metadata.customerName}</p>
          <p><strong>Email:</strong> ${metadata.customerEmail}</p>
          <p><strong>Teléfono:</strong> ${metadata.customerPhone}</p>
          <p><strong>DNI:</strong> ${metadata.customerDni}</p>
          <p><strong>Dirección:</strong> ${metadata.customerAddress}</p>
          <p><strong>Ciudad:</strong> ${metadata.customerCity}</p>
          <p><strong>Provincia:</strong> ${metadata.customerProvince}</p>
          <p><strong>Código Postal:</strong> ${metadata.customerPostalCode}</p>

          <h3 style="margin-top:30px;color:#1e73be;">Detalle del pedido</h3>

          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f0f0f0;">
                <th style="padding:10px;text-align:left;">Producto</th>
                <th style="padding:10px;text-align:center;">Cantidad</th>
                <th style="padding:10px;text-align:right;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>

          <h3 style="text-align:right;margin-top:20px;">Total: $${paymentData.transaction_amount}</h3>

          <p style="margin-top:20px;font-size:12px;color:#777;">
            ID de pago: ${payment_id}
          </p>

        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Chulo Tienda <onboarding@resend.dev>",
      to: "chulotienda26@gmail.com",
      subject: "Nueva venta en Chulo Tienda",
      html: ownerTemplate
    });

    return res.status(200).json({ success: true });

  } catch (error) {

    console.error("ERROR SEND EMAIL:", error);

    return res.status(500).json({ error: "Error sending email" });

  }

}
