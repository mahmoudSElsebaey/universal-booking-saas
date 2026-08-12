/**
 * Email service — SMTP / Resend architecture.
 * In development logs to console if SMTP is not configured.
 */
import { env } from '../config/env.js'

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private enabled() {
    return Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY)
  }

  async send(input: SendEmailInput) {
    if (!this.enabled()) {
      console.log('[EMAIL:DEV]', {
        to: input.to,
        subject: input.subject,
        preview: input.text || input.html.slice(0, 120),
      })
      return { queued: true, mode: 'dev-log' as const }
    }

    // Resend
    if (process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Bookora <onboarding@resend.dev>',
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text,
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        console.error('[EMAIL:RESEND]', body)
        throw new Error('Failed to send email')
      }
      return { queued: true, mode: 'resend' as const }
    }

    // Generic SMTP via nodemailer-style env (optional dependency)
    // Install nodemailer when deploying with SMTP:
    // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
    try {
      // Dynamic import keeps server runnable without nodemailer installed
      const nodemailer = await import('nodemailer' as string).catch(() => null)
      if (!nodemailer) {
        console.log('[EMAIL:SMTP] nodemailer not installed — logging only')
        console.log('[EMAIL]', input.to, input.subject)
        return { queued: true, mode: 'dev-log' as const }
      }
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      })
      return { queued: true, mode: 'smtp' as const }
    } catch (err) {
      console.error('[EMAIL:SMTP]', err)
      throw err
    }
  }

  async sendBookingConfirmed(params: {
    to: string
    customerName: string
    serviceName: string
    date: string
    time: string
    businessName: string
  }) {
    return this.send({
      to: params.to,
      subject: `Booking confirmed — ${params.businessName}`,
      text: `Hi ${params.customerName}, your booking for ${params.serviceName} on ${params.date} at ${params.time} is confirmed.`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2>Booking confirmed</h2>
          <p>Hi ${params.customerName},</p>
          <p>Your booking at <strong>${params.businessName}</strong> is confirmed.</p>
          <ul>
            <li><strong>Service:</strong> ${params.serviceName}</li>
            <li><strong>Date:</strong> ${params.date}</li>
            <li><strong>Time:</strong> ${params.time}</li>
          </ul>
          <p style="color:#7B8794">Powered by Bookora</p>
        </div>
      `,
    })
  }

  async sendPasswordReset(params: { to: string; resetUrl: string }) {
    return this.send({
      to: params.to,
      subject: 'Reset your password',
      text: `Reset your password: ${params.resetUrl}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2>Reset password</h2>
          <p>Click the link below to reset your password (valid for a limited time):</p>
          <p><a href="${params.resetUrl}">${params.resetUrl}</a></p>
        </div>
      `,
    })
  }
}

export const emailService = new EmailService()
