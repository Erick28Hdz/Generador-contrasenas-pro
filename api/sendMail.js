// sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Envía un correo con el mensaje de bienvenida.
 * @param {string} correo - Correo del destinatario.
 * @param {string} plan - Plan seleccionado.
 * @param {string} name - nombre usuario
 */
async function enviarCorreoRegistro(correo, plan, name) {
    if (!correo) {
        console.error('❌ Error: No se proporcionó un destinatario para el correo');
        return;
    }
    // Prepara y envía el correo
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: correo.trim(),
        subject: `🎉 Bienvenidx a Generador-Pro`,
        text: `¡Gracias por tu suscripción al plan ${plan}!\n`,
        html: `
                <div
                    style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #ddd; border-radius: 10px;">
                    <h1 style="color: #2c3e50;">🔐 Bienvenidx a Generador PRO</h1>
                    <p><b>Hola, ${name}</b></p>

                    <p>
                    Gracias por tu interés en fortalecer tu seguridad digital. <b>Generador PRO</b> es una herramienta diseñada
                    especialmente para quienes desean mantener contraseñas únicas, robustas y seguras en un entorno digital cada vez
                    más vulnerable.
                    </p>

                    <h2 style="color: #34495e;">🛡️ ¿Por qué usar Generador PRO?</h2>
                    <ul>
                    <li>🔑 Crea contraseñas aleatorias de nivel bancario.</li>
                    <li>🧠 Evita usar la misma contraseña en múltiples servicios.</li>
                    <li>📊 Aumenta la seguridad de tus cuentas personales o empresariales.</li>
                    </ul>

                    <h2 style="color: #34495e;">💳 Planes disponibles</h2>
                    <p><b>Mensual:</b> Ideal si solo necesitas protección temporal o estás probando el servicio.</p>
                    <p><b>Anual:</b> Perfecto si ya confías en nuestro sistema y deseas seguridad continua con acceso completo a las
                    funciones premium.</p>

                    <h2 style="color: #34495e;">💰 Realiza tu pago ahora</h2>
                    <p>Escoge el plan que más se ajuste a ti y realiza el pago seguro con PayU:</p>

                    <div style="margin: 30px 0; text-align: center;">
                    <p style="font-size: 16px; margin-bottom: 10px;"> Selecciona un plan y realiza el pago seguro con PayU:</p>

                    <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; text-align: center;">
                        <tr>
                            <td style="padding: 10px;">
                            <a href="https://biz.payulatam.com/L0fa08cB6734589" target="_blank" style="text-decoration: none;">
                                <img src="https://generador-contrasenas-pro.onrender.com/image/membresia-mensual.png" alt="Pago Mensual" style="width: 120px;">
                                <div style="background-color: #27ae60; color: white; padding: 10px 20px; border-radius: 6px; font-weight: bold;">Pagar Mensual</div>
                            </a>
                            </td>
                            <td style="padding: 10px;">
                            <a href="https://biz.payulatam.com/L0fa08cE186AE98" target="_blank" style="text-decoration: none;">
                                <img src="https://generador-contrasenas-pro.onrender.com/image/membresia-anual.png" alt="Pago Anual" style="width: 120px;">
                                <div style="background-color: #2980b9; color: white; padding: 10px 20px; border-radius: 6px; font-weight: bold;">Pagar Anual</div>
                            </a>
                            </td>
                        </tr>
                    </table>

                    <p style="font-size: 12px; color: #7f8c8d;">
                        Si tienes dudas o necesitas soporte, responde a este correo. Estamos aquí para ayudarte.
                    </p>

                    <hr>
                    <p style="font-size: 11px; color: #95a5a6;">Este correo fue generado automáticamente por Generador PRO. Por favor,
                        no lo reenvíes.</p>
                </div>`
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Correo enviado a', correo);
}

/**
 * Envía un correo de confirmación de la compra de la membresía.
 * @param {string} correo - Correo del destinatario.
 * @param {string} plan - Plan comprado.
 * @param {string} name - nombre usuario
 * @param {string} codigoGenerado - Código generado.
 * 
 */
async function enviarCorreoCompra(correo, plan, name, codigoGenerado) {
    if (!correo) {
        console.error('❌ Error: No se proporcionó un destinatario para el correo');
        return;
    }
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: correo.trim(),
        subject: `🛒 Confirmación de tu compra`,
        text: `Gracias por tu compra del plan ${plan}.\n\nTu código único es: ${codigoGenerado}\n\n¡Bienvenido!`,
        html: `
    <div
        style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #ddd; border-radius: 10px;">
        <h1 style="color: #2c3e50;">🎉 ¡Tu compra ha sido confirmada!</h1>
        <p><b>Hola, ${name}</b></p>

        <p>
        Gracias por confiar en <b>Generador PRO</b> y realizar tu compra. Estamos felices de tenerte como parte de nuestra comunidad. 
        A continuación encontrarás tu código único y todos los detalles sobre tu plan.
        </p>

        <h2 style="color: #34495e;">✅ Detalles de tu compra</h2>
        <p><b>Plan seleccionado:</b> ${plan}</p>
        <p><b>Código único:</b></p>
        <p
            style="font-size: 20px; font-weight: bold; background: #ecf0f1; padding: 10px; border-radius: 5px; display: inline-block;">
            ${codigoGenerado}</p>

        <p style="font-size: 12px; color: #7f8c8d;">
            Si tienes alguna pregunta o necesitas soporte, no dudes en responder a este correo. Estamos aquí para ayudarte.
        </p>

        <hr>
        <p style="font-size: 11px; color: #95a5a6;">Este correo fue generado automáticamente por Generador PRO. Por favor,
            no lo reenvíes.</p>
    </div>` // Aquí va el HTML con un mensaje para confirmar la compra
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Correo de compra enviado a', correo);
}

module.exports = { enviarCorreoRegistro, enviarCorreoCompra };
