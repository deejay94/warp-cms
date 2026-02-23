import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateTopicSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  platformId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['NOT_STARTED', 'COMPLETED']).optional(),
  isPublished: z.boolean().optional(),
});

// PATCH /api/topics/[id] - Update a topic
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTopicSchema.parse(body);

    // If status is being set to COMPLETED, add completedAt timestamp
    const updateData: any = { ...validatedData };
    if (validatedData.status === 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (validatedData.status === 'NOT_STARTED') {
      updateData.completedAt = null;
    }

    const topic = await prisma.topic.update({
      where: { id },
      data: updateData,
      include: {
        platform: true,
        category: true,
      },
    });

    return NextResponse.json(topic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating topic:', error);
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    );
  }
}

// DELETE /api/topics/[id] - Delete a topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.topic.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    );
  }
}
