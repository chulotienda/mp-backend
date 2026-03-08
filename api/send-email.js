import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    const {
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
    } = req.body;

    const logoUrl = "https://raw.githubusercontent.com/chulotienda/mp-backend/main/logo-chulo.png";

    const productRows = products.map(product => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${product.title}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${product.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${product.price}</td>
      </tr>
    `).join("");

    const ownerTemplate = `
      <div style="font-family: Arial, sans-serif; background:#f4f8fb; padding:40px;">
        <div style="max-width:700px;margin:auto;background:white;padding:30px;border-radius:10px;">

          <div style="text-align:center;margin-bottom:30px;">
            <img src="${logoUrl}" style="max-width:200px;">
          </div>

          <h2 style="color:#1e73be;">Nueva venta realizada</h2>

          <p><strong>Cliente:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Teléfono:</strong> ${customerPhone}</p>
          <p><strong>DNI:</strong> ${customerDni}</p>
          <p><strong>Dirección:</strong> ${customerAddress}</p>
          <p><strong>Ciudad:</strong> ${customerCity}</p>
          <p><strong>Provincia:</strong> ${customerProvince}</p>
          <p><strong>Código Postal:</strong> ${customerPostalCode}</p>

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

          <h3 style="text-align:right;margin-top:20px;">Total: $${totalAmount}</h3>

          <p style="margin-top:20px;font-size:12px;color:#777;">
            ID de pago: ${paymentId}
          </p>

        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Chulo Tienda <onboarding@resend.dev>',
      to: 'chulotienda26@gmail.com',
      subject: 'Nueva venta en Chulo Tienda',
      html: ownerTemplate
    });

    return res.status(200).json({ success: true });

  } catch (error) {

    console.error(error);

    return res.status(500).json({ error: 'Error sending email' });

  }

}
