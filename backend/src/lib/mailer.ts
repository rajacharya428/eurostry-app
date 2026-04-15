import nodemailer from 'nodemailer'

type InquiryNotificationInput = {
  inquiry: {
    id: string
    name: string
    email: string
    phone: string | null
    message: string
    type: 'PROPERTY_CONTACT' | 'BOOKING_REQUEST'
    requestedStartDate?: Date | null
    requestedEndDate?: Date | null
    createdAt: Date
  }
  property: {
    id: string
    slug: string
    title: string
    location: string
  }
}

type ContactNotificationInput = {
  contactMessage: {
    id: string
    name: string
    email: string
    phone: string | null
    message: string
    createdAt: Date
  }
}

function formatDate(value?: Date | null) {
  if (!value) {
    return 'Not provided'
  }

  return value.toISOString().slice(0, 10)
}

function getMailerConfig() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const to = process.env.INQUIRY_NOTIFICATION_EMAIL
  const from = process.env.SMTP_FROM_EMAIL ?? user

  if (!host || !user || !pass || !to || !from) {
    return null
  }

  return {
    host,
    port,
    user,
    pass,
    to,
    from,
    secure: port === 465,
  }
}

export async function sendInquiryNotification(input: InquiryNotificationInput) {
  const config = getMailerConfig()
  if (!config) {
    return { delivered: false, reason: 'missing_config' as const }
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })

  const subjectPrefix =
    input.inquiry.type === 'BOOKING_REQUEST' ? 'Booking request' : 'Property inquiry'

  const text = [
    `${subjectPrefix} received for EUROSTRY.`,
    '',
    `Apartment: ${input.property.title}`,
    `Apartment ID: ${input.property.id}`,
    `Slug: ${input.property.slug}`,
    `Location: ${input.property.location}`,
    '',
    `Inquiry ID: ${input.inquiry.id}`,
    `Type: ${input.inquiry.type}`,
    `Name: ${input.inquiry.name}`,
    `Email: ${input.inquiry.email}`,
    `Phone: ${input.inquiry.phone ?? 'Not provided'}`,
    `Requested start date: ${formatDate(input.inquiry.requestedStartDate)}`,
    `Requested end date: ${formatDate(input.inquiry.requestedEndDate)}`,
    `Created at: ${input.inquiry.createdAt.toISOString()}`,
    '',
    'Message:',
    input.inquiry.message,
  ].join('\n')

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: input.inquiry.email,
    subject: `[EUROSTRY] ${subjectPrefix}: ${input.property.title} (${input.property.id})`,
    text,
  })

  return { delivered: true as const }
}

export async function sendContactNotification(input: ContactNotificationInput) {
  const config = getMailerConfig()
  if (!config) {
    return { delivered: false, reason: 'missing_config' as const }
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })

  const text = [
    'General contact message received for EUROSTRY.',
    '',
    `Contact ID: ${input.contactMessage.id}`,
    `Name: ${input.contactMessage.name}`,
    `Email: ${input.contactMessage.email}`,
    `Phone: ${input.contactMessage.phone ?? 'Not provided'}`,
    `Created at: ${input.contactMessage.createdAt.toISOString()}`,
    '',
    'Message:',
    input.contactMessage.message,
  ].join('\n')

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: input.contactMessage.email,
    subject: `[EUROSTRY] Contact message: ${input.contactMessage.name}`,
    text,
  })

  return { delivered: true as const }
}
