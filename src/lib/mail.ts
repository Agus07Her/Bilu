import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
    await resend.emails.send({
        from: 'Bilu <onboarding@resend.dev>',
        to: email,
        subject: 'Confirma tu cuenta en Bilu',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 20px;">
        <h2 style="color: #1d4ed8; font-weight: 900;">¡Bienvenido a Bilu!</h2>
        <p style="color: #475569; font-size: 16px; font-weight: 500;">Estás a un paso de tomar el control de tus finanzas. Por favor, ingresa el siguiente código para verificar tu cuenta:</p>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 15px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #1e293b;">${token}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">Este código expirará en 15 minutos. Si no creaste esta cuenta, puedes ignorar este correo.</p>
      </div>
    `
    });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    await resend.emails.send({
        from: 'Bilu <onboarding@resend.dev>',
        to: email,
        subject: 'Restablece tu contraseña en Bilu',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 20px;">
        <h2 style="color: #1d4ed8; font-weight: 900;">Restablecer Contraseña</h2>
        <p style="color: #475569; font-size: 16px; font-weight: 500;">Has solicitado restablecer tu contraseña. Ingresa el siguiente código en la aplicación:</p>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 15px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #1e293b;">${token}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">Este código expirará en 15 minutos. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
      </div>
    `
    });
};
