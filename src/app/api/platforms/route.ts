import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createPlatformSchema = z.object({
  name: z.string().min(1, 'Platform name is required'),
});

// GET /api/platforms - List all platforms
export async function GET() {
  try {
    const platforms = await prisma.platform.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(platforms);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platforms' },
      { status: 500 }
    );
  }
}

// POST /api/platforms - Create a new platform
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPlatformSchema.parse(body);

    const platform = await prisma.platform.create({
      data: validatedData,
    });

    return NextResponse.json(platform, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating platform:', error);
    return NextResponse.json(
      { error: 'Failed to create platform' },
      { status: 500 }
    );
  }
}
