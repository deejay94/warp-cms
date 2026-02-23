import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOpenAI, isOpenAIConfigured } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured',
          message: 'Please add OPENAI_API_KEY to your .env file to use AI generation features.'
        },
        { status: 500 }
      );
    }

    const openai = getOpenAI();
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI client not initialized' },
        { status: 500 }
      );
    }

    // Get body with optional count
    const body = await request.json();
    const count = body.count || 5;

    // Fetch existing topics to analyze patterns
    const topics = await prisma.topic.findMany({
      include: {
        platform: true,
        category: true,
      },
      take: 50, // Use last 50 topics for context
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch platforms and categories
    const platforms = await prisma.platform.findMany();
    const categories = await prisma.category.findMany();

    // Build context for AI
    const topicExamples = topics
      .map(
        (t) =>
          `- "${t.title}" (${t.platform.name}, ${t.category.name})${
            t.description ? `: ${t.description}` : ''
          }`
      )
      .join('\n');

    const platformList = platforms.map((p) => p.name).join(', ');
    const categoryList = categories.map((c) => c.name).join(', ');

    const prompt = `You are a content strategist helping to generate social media content ideas.

Available platforms: ${platformList}
Available categories: ${categoryList}

Here are some existing content topics for reference:
${topicExamples || 'No existing topics yet.'}

Based on these examples and the available platforms/categories, generate ${count} new, creative content topic ideas. Each idea should:
1. Be specific and actionable
2. Fit one of the available platforms
3. Match one of the available categories
4. Be different from existing topics
5. Be relevant and engaging

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "topic title here",
    "description": "brief description",
    "platform": "platform name",
    "category": "category name"
  }
]

Important: Return ONLY the JSON array, no additional text or formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful content strategist that generates creative social media content ideas. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the JSON response
    let ideas;
    try {
      ideas = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    // Validate and match platform/category IDs
    const validatedIdeas = [];
    for (const idea of ideas) {
      const platform = platforms.find(
        (p) => p.name.toLowerCase() === idea.platform.toLowerCase()
      );
      const category = categories.find(
        (c) => c.name.toLowerCase() === idea.category.toLowerCase()
      );

      if (platform && category) {
        // Save to database
        const savedIdea = await prisma.generatedIdea.create({
          data: {
            content: `${idea.title}\n\n${idea.description}`,
            suggestedPlatformId: platform.id,
            suggestedCategoryId: category.id,
          },
          include: {
            suggestedPlatform: true,
            suggestedCategory: true,
          },
        });
        validatedIdeas.push(savedIdea);
      }
    }

    return NextResponse.json(validatedIdeas);
  } catch (error) {
    console.error('Error generating ideas:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate ideas',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/generate - Get all generated ideas
export async function GET() {
  try {
    const ideas = await prisma.generatedIdea.findMany({
      where: {
        isAccepted: false,
      },
      include: {
        suggestedPlatform: true,
        suggestedCategory: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Error fetching generated ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generated ideas' },
      { status: 500 }
    );
  }
}
