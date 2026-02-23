import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the generated idea
    const idea = await prisma.generatedIdea.findUnique({
      where: { id },
      include: {
        suggestedPlatform: true,
        suggestedCategory: true,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Generated idea not found' },
        { status: 404 }
      );
    }

    if (!idea.suggestedPlatformId || !idea.suggestedCategoryId) {
      return NextResponse.json(
        { error: 'Generated idea missing platform or category' },
        { status: 400 }
      );
    }

    // Extract title and description from content
    const [title, ...descriptionParts] = idea.content.split('\n\n');
    const description = descriptionParts.join('\n\n').trim() || null;

    // Create a new topic from the idea
    const topic = await prisma.topic.create({
      data: {
        title: title.trim(),
        description,
        platformId: idea.suggestedPlatformId,
        categoryId: idea.suggestedCategoryId,
      },
      include: {
        platform: true,
        category: true,
      },
    });

    // Mark the idea as accepted and link to the created topic
    await prisma.generatedIdea.update({
      where: { id },
      data: {
        isAccepted: true,
        acceptedAsTopicId: topic.id,
      },
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error accepting generated idea:', error);
    return NextResponse.json(
      { error: 'Failed to accept generated idea' },
      { status: 500 }
    );
  }
}
