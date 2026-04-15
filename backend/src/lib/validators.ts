import { FurnishingStatus, InquiryType, PropertyEventType, PropertyStatus, RentalType, UserRole } from '@prisma/client'
import { z } from 'zod'

const propertyImageUrlSchema = z.string().refine(
  (value) => {
    if (!value) {
      return false
    }

    if (value.startsWith('/')) {
      return true
    }

    return /^https?:\/\//.test(value)
  },
  {
    message: 'Image URL must start with http://, https://, or /uploads/...',
  },
)

export const registerSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters long')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[0-9]/, 'Password must include a number'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const propertyCreateSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  summary: z.string().optional(),
  description: z.string().min(10),
  location: z.string().min(2),
  mapQuery: z.string().optional(),
  transportDetails: z.string().optional(),
  city: z.string().min(2),
  country: z.string().min(2),
  bedrooms: z.int().min(0),
  bathrooms: z.int().min(0),
  squareMeters: z.int().min(8),
  maxGuests: z.int().min(1).optional(),
  priceCents: z.int().min(1),
  currency: z.string().default('EUR'),
  rentalType: z.enum(RentalType),
  furnishingStatus: z.enum(FurnishingStatus).default(FurnishingStatus.FURNISHED),
  status: z.enum(PropertyStatus).default(PropertyStatus.DRAFT),
  available: z.boolean().default(true),
  images: z.array(z.object({
    url: propertyImageUrlSchema,
    alt: z.string().optional(),
    sortOrder: z.int().min(0).default(0),
  })).default([]),
  amenities: z.array(z.string().min(1)).default([]),
})

export const inquiryCreateSchema = z.object({
  propertyId: z.string().cuid().optional(),
  propertySlug: z.string().optional(),
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  message: z.string().min(5),
  type: z.enum(InquiryType).default(InquiryType.PROPERTY_CONTACT),
  requestedStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  requestedEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const contactMessageSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  message: z.string().min(5),
})

export const propertyEventCreateSchema = z.object({
  propertyId: z.string().cuid().optional(),
  propertySlug: z.string().optional(),
  eventType: z.enum(PropertyEventType),
  page: z.string().optional(),
})
