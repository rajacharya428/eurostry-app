import 'dotenv/config'
import {
  AuthProvider,
  FurnishingStatus,
  PrismaClient,
  PropertyStatus,
  RentalType,
  UserRole,
} from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('Missing DATABASE_URL for seed script')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
const seedPassword = 'Eurostry1234'

async function main() {
  const passwordHash = await hash(seedPassword, 12)
  const amenityNames = [
    'WiFi',
    'Kitchen',
    'Washer',
    'Heating',
    'Workspace',
    'Concierge',
    'Parking',
  ]

  await Promise.all(
    amenityNames.map((name) =>
      prisma.amenity.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  )

  const owner = await prisma.user.upsert({
    where: { email: 'owner@eurostry.com' },
    update: {},
    create: {
      email: 'owner@eurostry.com',
      firstName: 'Elena',
      lastName: 'Moreau',
      role: UserRole.OWNER,
      passwordHash,
      phone: '+33 6 11 22 33 44',
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@eurostry.com' },
    update: {},
    create: {
      email: 'admin@eurostry.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      passwordHash,
    },
  })

  const tenant = await prisma.user.upsert({
    where: { email: 'tenant@eurostry.com' },
    update: {},
    create: {
      email: 'tenant@eurostry.com',
      firstName: 'Camille',
      lastName: 'Laurent',
      role: UserRole.TENANT,
      passwordHash,
    },
  })

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: AuthProvider.CREDENTIALS,
        providerAccountId: owner.email,
      },
    },
    update: {},
    create: {
      userId: owner.id,
      provider: AuthProvider.CREDENTIALS,
      providerAccountId: owner.email,
    },
  })

  const amenities = await prisma.amenity.findMany()
  const amenityMap = new Map(amenities.map((amenity) => [amenity.name, amenity.id]))

  const propertyRecords = [
    {
      slug: 'paris-apartment-marais-district',
      title: 'Paris Apartment - Marais District',
      summary: 'Classic Paris apartment for long-term stays in Le Marais.',
      description:
        'Beautiful apartment in the heart of Le Marais with modern amenities and classic Parisian charm.',
      location: 'Paris, France',
      mapQuery: '16 Rue des Francs Bourgeois, 75003 Paris, France',
      transportDetails:
        'Metro 1 Saint-Paul | 5 min walk\nBus 29, 96 | 3 min walk\nChatelet-Les Halles RER | 14 min by metro',
      city: 'Paris',
      country: 'France',
      bedrooms: 2,
      bathrooms: 1,
      squareMeters: 64,
      maxGuests: 4,
      priceCents: 120000,
      rentalType: RentalType.LONG_TERM,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      imageUrls: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
      ],
      amenities: ['WiFi', 'Kitchen', 'Washer', 'Heating'],
    },
    {
      slug: 'modern-studio-la-defense',
      title: 'Modern Studio - La Defense',
      summary: 'Compact furnished studio near the business district.',
      description:
        'Sleek modern studio perfect for business travelers, close to business district.',
      location: 'Paris, France',
      mapQuery: 'La Defense, Courbevoie, France',
      transportDetails:
        'Metro 1 La Defense | 6 min walk\nRER A La Defense | 6 min walk\nTram T2 | 8 min walk',
      city: 'Paris',
      country: 'France',
      bedrooms: 0,
      bathrooms: 1,
      squareMeters: 28,
      maxGuests: 2,
      priceCents: 8500,
      rentalType: RentalType.SHORT_TERM,
      furnishingStatus: FurnishingStatus.FURNISHED,
      imageUrls: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
      ],
      amenities: ['WiFi', 'Workspace', 'Heating'],
    },
    {
      slug: 'sunlit-one-bedroom-batignolles',
      title: 'Sunlit One Bedroom - Batignolles',
      summary: 'Bright one-bedroom rental in a calm residential pocket.',
      description:
        'Warm one-bedroom apartment with high ceilings, a separate kitchen, and quick metro access for everyday Paris living.',
      location: 'Batignolles, Paris, France',
      mapQuery: 'Batignolles, 75017 Paris, France',
      transportDetails:
        'Metro 13 Brochant | 6 min walk\nBus 66 | 4 min walk\nPont Cardinet train station | 10 min walk',
      city: 'Paris',
      country: 'France',
      bedrooms: 1,
      bathrooms: 1,
      squareMeters: 43,
      maxGuests: 2,
      priceCents: 145000,
      rentalType: RentalType.LONG_TERM,
      furnishingStatus: FurnishingStatus.FURNISHED,
      imageUrls: [
        'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200',
      ],
      amenities: ['WiFi', 'Kitchen', 'Heating'],
    },
    {
      slug: 'family-flat-boulogne',
      title: 'Family Flat - Boulogne',
      summary: 'Large unfurnished apartment for families needing space.',
      description:
        'Three-bedroom apartment with generous living spaces, balcony access, and storage, ideal for a long-term family setup.',
      location: 'Boulogne-Billancourt, France',
      mapQuery: 'Boulogne-Billancourt, France',
      transportDetails:
        'Metro 10 Boulogne Jean Jaures | 7 min walk\nBus 52, 72 | 4 min walk\nTram T2 | 11 min walk',
      city: 'Boulogne-Billancourt',
      country: 'France',
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 96,
      maxGuests: 5,
      priceCents: 230000,
      rentalType: RentalType.LONG_TERM,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      imageUrls: [
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200',
      ],
      amenities: ['WiFi', 'Kitchen', 'Parking', 'Heating'],
    },
    {
      slug: 'canal-saint-martin-designer-studio',
      title: 'Designer Studio - Canal Saint-Martin',
      summary: 'Short-stay studio with a refined interior close to cafes and nightlife.',
      description:
        'Compact but polished studio with custom storage, a work nook, and a fully equipped kitchenette for short city stays.',
      location: 'Canal Saint-Martin, Paris, France',
      mapQuery: 'Canal Saint-Martin, Paris, France',
      transportDetails:
        'Metro 5 Jacques Bonsergent | 5 min walk\nBus 75 | 3 min walk\nGare de l Est | 12 min walk',
      city: 'Paris',
      country: 'France',
      bedrooms: 0,
      bathrooms: 1,
      squareMeters: 24,
      maxGuests: 2,
      priceCents: 11000,
      rentalType: RentalType.SHORT_TERM,
      furnishingStatus: FurnishingStatus.FURNISHED,
      imageUrls: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200',
      ],
      amenities: ['WiFi', 'Workspace', 'Heating'],
    },
    {
      slug: 'executive-two-bedroom-levallois',
      title: 'Executive Two Bedroom - Levallois',
      summary: 'Well-connected furnished apartment for professionals and relocations.',
      description:
        'Two-bedroom executive apartment with modern finishes, strong natural light, and flexible lease terms for business relocations.',
      location: 'Levallois-Perret, France',
      mapQuery: 'Levallois-Perret, France',
      transportDetails:
        'Metro 3 Anatole France | 6 min walk\nBus 174 | 3 min walk\nClichy-Levallois train station | 12 min walk',
      city: 'Levallois-Perret',
      country: 'France',
      bedrooms: 2,
      bathrooms: 1,
      squareMeters: 58,
      maxGuests: 4,
      priceCents: 175000,
      rentalType: RentalType.LONG_TERM,
      furnishingStatus: FurnishingStatus.FURNISHED,
      imageUrls: [
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200',
      ],
      amenities: ['WiFi', 'Workspace', 'Washer', 'Heating'],
    },
    {
      slug: 'montparnasse-loft-duplex',
      title: 'Loft Duplex - Montparnasse',
      summary: 'Character-filled duplex with open volume and flexible layout.',
      description:
        'Stylish duplex loft with exposed structure, open living space, and room for a home office, ideal for a creative urban lifestyle.',
      location: 'Montparnasse, Paris, France',
      mapQuery: 'Montparnasse, Paris, France',
      transportDetails:
        'Metro 4 Vavin | 5 min walk\nBus 91 | 3 min walk\nGare Montparnasse | 10 min walk',
      city: 'Paris',
      country: 'France',
      bedrooms: 2,
      bathrooms: 2,
      squareMeters: 72,
      maxGuests: 4,
      priceCents: 210000,
      rentalType: RentalType.LONG_TERM,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      imageUrls: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200',
      ],
      amenities: ['WiFi', 'Kitchen', 'Heating', 'Workspace'],
    },
  ]

  for (const record of propertyRecords) {
    const property = await prisma.property.upsert({
      where: { slug: record.slug },
      update: {
        title: record.title,
        summary: record.summary,
        description: record.description,
        location: record.location,
        mapQuery: record.mapQuery,
        transportDetails: record.transportDetails,
        city: record.city,
        country: record.country,
        bedrooms: record.bedrooms,
        bathrooms: record.bathrooms,
        squareMeters: record.squareMeters,
        maxGuests: record.maxGuests,
        priceCents: record.priceCents,
        rentalType: record.rentalType,
        furnishingStatus: record.furnishingStatus,
        status: PropertyStatus.PUBLISHED,
        available: true,
        ownerId: owner.id,
      },
      create: {
        ownerId: owner.id,
        slug: record.slug,
        title: record.title,
        summary: record.summary,
        description: record.description,
        location: record.location,
        mapQuery: record.mapQuery,
        transportDetails: record.transportDetails,
        city: record.city,
        country: record.country,
        bedrooms: record.bedrooms,
        bathrooms: record.bathrooms,
        squareMeters: record.squareMeters,
        maxGuests: record.maxGuests,
        priceCents: record.priceCents,
        rentalType: record.rentalType,
        furnishingStatus: record.furnishingStatus,
        status: PropertyStatus.PUBLISHED,
        available: true,
        publishedAt: new Date(),
      },
    })

    await prisma.propertyImage.deleteMany({ where: { propertyId: property.id } })
    await prisma.propertyAmenity.deleteMany({ where: { propertyId: property.id } })

    await prisma.propertyImage.createMany({
      data: record.imageUrls.map((url, index) => ({
        propertyId: property.id,
        url,
        alt: record.title,
        sortOrder: index,
      })),
    })

    await prisma.propertyAmenity.createMany({
      data: record.amenities.map((name) => ({
        propertyId: property.id,
        amenityId: amenityMap.get(name),
      })),
      skipDuplicates: true,
    })
  }

  const maraisProperty = await prisma.property.findUniqueOrThrow({
    where: { slug: 'paris-apartment-marais-district' },
  })

  await prisma.inquiry.upsert({
    where: { id: 'seed-inquiry-marais' },
    update: {
      propertyId: maraisProperty.id,
      userId: tenant.id,
      name: 'Camille Laurent',
      email: tenant.email,
      message: 'I would like to schedule a visit next week.',
    },
    create: {
      id: 'seed-inquiry-marais',
      propertyId: maraisProperty.id,
      userId: tenant.id,
      name: 'Camille Laurent',
      email: tenant.email,
      message: 'I would like to schedule a visit next week.',
    },
  })

  console.log(`Seeded users: ${[admin.email, owner.email, tenant.email].join(', ')}`)
  console.log(`Seed password: ${seedPassword}`)
  console.log(`Seeded properties: ${propertyRecords.length}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
