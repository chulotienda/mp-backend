import mercadopago from "mercadopago";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { items, customer } = req.body;

  try {
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN
    });

    const preference = {
      items: items,
      payer: {
        name: customer.name,
        email: customer.email
      },
      back_urls: {
        success: "https://chulotienda.lovable.app",
        failure: "https://chulotienda.lovable.app",
        pending: "https://chulotienda.lovable.app"
      },
      auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);

    // CONFIGURACIÓN DE MAIL
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const productList = items.map(item => 
      `Producto: ${item.title} | Cantidad: ${item.quantity} | Precio: ${item.unit_price}`
    ).join("\n");

    const total = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "chulotienda26@gmail.com",
      subject: "Nuevo pedido recibido - Chulo Tienda",
      text: `
Nuevo pedido recibido:

Nombre: ${customer.name}
Email: ${customer.email}
Teléfono: ${customer.phone}
DNI: ${customer.dni}
Dirección: ${customer.address}
Ciudad: ${customer.city}
Provincia: ${customer.province}
Código Postal: ${customer.postalCode}

Productos:
${productList}

Total: $${total}
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ init_point: response.body.init_point });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
