import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTopicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  platformId: z.string().min(1, 'Platform is required'),
  categoryId: z.string().min(1, 'Category is required'),
});

// GET /api/topics - List all topics with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const platformId = searchParams.get('platformId');
    const categoryId = searchParams.get('categoryId');

    const topics = await prisma.topic.findMany({
      where: {
        ...(status && { status }),
        ...(platformId && { platformId }),
        ...(categoryId && { categoryId }),
      },
      include: {
        platform: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

// POST /api/topics - Create a new topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTopicSchema.parse(body);

    const topic = await prisma.topic.create({
      data: validatedData,
      include: {
        platform: true,
        category: true,
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}
