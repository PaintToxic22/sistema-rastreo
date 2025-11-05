const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('./logger');

/**
 * Crear transporter de nodemailer
 */
const createTransporter = () => {
  // Si no hay credenciales, usar ethereal para testing
  if (!config.email.auth.user || !config.email.auth.pass) {
    logger.warn('⚠️  Credenciales de email no configuradas. Emails no se enviarán.');
    return null;
  }

  return nodemailer.createTransport(config.email);
};

const transporter = createTransporter();

/**
 * Enviar email genérico
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    logger.warn('Email no enviado (transporter no configurado):', { to, subject });
    return { success: false, message: 'Transporter no configurado' };
  }

  try {
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
      html
    });

    logger.info('✅ Email enviado exitosamente:', { 
      to, 
      subject, 
      messageId: info.messageId 
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Error al enviar email:', { to, subject, error: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * Enviar notificación de nuevo tracking
 */
const sendTrackingNotification = async (email, codigo, tipo) => {
  const tipoTexto = tipo === 'encomienda' ? 'encomienda' : 'orden de flete';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%); 
                  color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #0d6efd; color: white; 
                  padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                  margin: 20px 0; }
        .code { background: #fff; padding: 15px; border-left: 4px solid #0d6efd; 
                margin: 20px 0; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; color: #6c757d; margin-top: 30px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 LonquiExpress</h1>
          <p>Tu ${tipoTexto} ha sido registrada</p>
        </div>
        <div class="content">
          <p>Hola,</p>
          <p>Tu ${tipoTexto} ha sido registrada exitosamente en nuestro sistema.</p>
          
          <div class="code">
            📦 Código de seguimiento: <strong>${codigo}</strong>
          </div>
          
          <p>Puedes hacer seguimiento de tu ${tipoTexto} en tiempo real usando este código.</p>
          
          <center>
            <a href="http://localhost:8080/seguimiento.html?codigo=${codigo}" class="button">
              Ver Seguimiento
            </a>
          </center>
          
          <p>Si tienes alguna consulta, no dudes en contactarnos.</p>
          
          <p>Saludos,<br><strong>Equipo LonquiExpress</strong></p>
        </div>
        <div class="footer">
          <p>Este es un email automático, por favor no responder.</p>
          <p>© 2025 LonquiExpress - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Tu ${tipoTexto} ${codigo} ha sido registrada - LonquiExpress`,
    html,
    text: `Tu ${tipoTexto} ${codigo} ha sido registrada. Puedes hacer seguimiento en: http://localhost:8080/seguimiento.html?codigo=${codigo}`
  });
};

/**
 * Enviar notificación de cambio de estado
 */
const sendStatusChangeNotification = async (email, codigo, estadoNuevo, tipo) => {
  const tipoTexto = tipo === 'encomienda' ? 'encomienda' : 'orden de flete';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                  color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .status { background: #fff; padding: 20px; border-left: 4px solid #28a745; 
                  margin: 20px 0; text-align: center; }
        .button { display: inline-block; background: #28a745; color: white; 
                  padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                  margin: 20px 0; }
        .footer { text-align: center; color: #6c757d; margin-top: 30px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📍 Actualización de Estado</h1>
          <p>Tu ${tipoTexto} ${codigo}</p>
        </div>
        <div class="content">
          <p>Hola,</p>
          <p>Tu ${tipoTexto} ha cambiado de estado:</p>
          
          <div class="status">
            <h2 style="margin: 0; color: #28a745;">${estadoNuevo}</h2>
          </div>
          
          <p>Puedes ver el seguimiento completo en nuestra plataforma.</p>
          
          <center>
            <a href="http://localhost:8080/seguimiento.html?codigo=${codigo}" class="button">
              Ver Detalles
            </a>
          </center>
          
          <p>Gracias por confiar en nosotros.</p>
          
          <p>Saludos,<br><strong>Equipo LonquiExpress</strong></p>
        </div>
        <div class="footer">
          <p>Este es un email automático, por favor no responder.</p>
          <p>© 2025 LonquiExpress - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Actualización: Tu ${tipoTexto} ${codigo} - ${estadoNuevo}`,
    html,
    text: `Tu ${tipoTexto} ${codigo} ha cambiado de estado a: ${estadoNuevo}. Ver más: http://localhost:8080/seguimiento.html?codigo=${codigo}`
  });
};

/**
 * Verificar configuración de email
 */
const verifyEmailConfig = async () => {
  if (!transporter) {
    return { success: false, message: 'Transporter no configurado' };
  }

  try {
    await transporter.verify();
    logger.info('✅ Configuración de email verificada correctamente');
    return { success: true, message: 'Email configurado correctamente' };
  } catch (error) {
    logger.error('❌ Error en configuración de email:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendEmail,
  sendTrackingNotification,
  sendStatusChangeNotification,
  verifyEmailConfig
};
