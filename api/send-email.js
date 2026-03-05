import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  // CORS
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
      customerDni,
      productTitle,
      productPrice,
      quantity,
      totalAmount,
      paymentId
    } = req.body;

    const logoUrl = "https://raw.githubusercontent.com/chulotienda/mp-backend/main/logo-chulo.png";

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color:#f4f8fb; padding:40px;">
        <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px;">
          
          <div style="text-align:center; margin-bottom:30px;">
            <img src="${logoUrl}" alt="Chulo Tienda" style="max-width:200px;" />
          </div>

          <h2 style="color:#1e73be;">¡Gracias por tu compra!</h2>

          <p style="color:#333;">Hola <strong>${customerName}</strong>,</p>
          
          <p style="color:#333;">
            Recibimos tu pago correctamente. Estamos preparando tu pedido con mucho cuidado.
          </p>

          <hr style="margin:25px 0;" />

          <h3 style="color:#1e73be;">Detalle de tu compra</h3>

          <p><strong>Producto:</strong> ${productTitle}</p>
          <p><strong>Cantidad:</strong> ${quantity}</p>
          <p><strong>Total abonado:</strong> $${totalAmount}</p>
          <p><strong>ID de pago:</strong> ${paymentId}</p>

          <hr style="margin:25px 0;" />

          <p style="color:#333;">
            Si tenés alguna duda, podés responder este correo.
          </p>

          <p style="color:#1e73be; font-weight:bold;">
            Chulo Tienda
          </p>

        </div>
      </div>
    `;

    const ownerTemplate = `
      <div style="font-family: Arial, sans-serif; background-color:#f4f8fb; padding:40px;">
        <div style="max-width:600px; margin:0 auto; background:white; padding:30px; border-radius:10px;">
          
          <div style="text-align:center; margin-bottom:30px;">
            <img src="${logoUrl}" alt="Chulo Tienda" style="max-width:200px;" />
          </div>

          <h2 style="color:#1e73be;">Nueva venta realizada</h2>

          <p><strong>Cliente:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Teléfono:</strong> ${customerPhone}</p>
          <p><strong>DNI:</strong> ${customerDni || "No informado"}</p>
          <p><strong>Dirección:</strong> ${customerAddress}</p>
          <p><strong>Ciudad:</strong> ${customerCity}</p>
          <p><strong>Provincia:</strong> ${customerProvince}</p>

          <hr style="margin:25px 0;" />

          <h3 style="color:#1e73be;">Detalle del pedido</h3>

          <p><strong>Producto:</strong> ${productTitle}</p>
          <p><strong>Cantidad:</strong> ${quantity}</p>
          <p><strong>Total:</strong> $${totalAmount}</p>
          <p><strong>ID de pago:</strong> ${paymentId}</p>

        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Chulo Tienda <chulotienda26@gmail.com>',
      to: customerEmail,
      subject: 'Confirmación de compra - Chulo Tienda',
      html: htmlTemplate
    });

    await resend.emails.send({
      from: 'Chulo Tienda <chulotienda26@gmail.com>',
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
