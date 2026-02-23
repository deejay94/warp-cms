# Content Management System

A modern web application for managing and generating content ideas across multiple social platforms (LinkedIn, Threads, Instagram). Built with Next.js, TypeScript, Prisma, and OpenAI.

## Features

- **Content Topic Management**: Create, organize, and track content ideas
- **Multi-Platform Support**: Manage content for LinkedIn, Threads, Instagram (extensible)
- **Custom Categories**: Organize by Career Advice, Thought Leadership, Resources (user-extensible)
- **Status Tracking**: Track topics as "Not Started" or "Completed"
- **AI Content Generation**: Generate new content ideas based on your existing topics using OpenAI
- **Clean Dashboard**: Visual stats and organized views of pending/completed topics
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: SQLite (development) with Prisma ORM
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack React Query
- **AI**: OpenAI GPT-4o-mini

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key (optional, only needed for AI generation features)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

The `.env` file should already exist with:

```env
DATABASE_URL="file:./dev.db"
```

If you want to use AI content generation, add your OpenAI API key:

```env
OPENAI_API_KEY="sk-your-api-key-here"
```

**Note**: The app works perfectly fine without the OpenAI key; you just won't be able to use the AI generation feature.

### 3. Set Up the Database

The database should already be set up with initial data. If you need to reset it:

```bash
# Reset database and run migrations
npx prisma migrate reset --force

# Or just run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating Topics

1. Fill out the "Add New Topic" form on the left side
2. Enter a title and optional description
3. Select a platform (LinkedIn, Threads, or Instagram)
4. Select a category (Career Advice, Thought Leadership, or Resources)
5. Click "Create Topic"

### Managing Topics

- **Mark Complete**: Click "Mark Complete" on any topic to move it to the Completed section
- **Mark Incomplete**: Click "Mark Incomplete" to move it back to Pending
- **Mark Published**: Track which topics have been published to social media
- **Delete**: Remove topics you no longer need

### AI Content Generation (Requires OpenAI API Key)

1. Scroll to the "AI Generated Ideas" section
2. Click "Generate Ideas" to create 5 new content suggestions
3. The AI will analyze your existing topics and generate similar ideas
4. Review the generated ideas and click "Accept & Add to Topics" to convert them into topics

### Adding Custom Platforms/Categories

To add new platforms or categories, you can:

**Option 1: Use the API directly**
```bash
# Add a new platform
curl -X POST http://localhost:3000/api/platforms \
  -H "Content-Type: application/json" \
  -d '{"name":"TikTok"}'

# Add a new category
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Tutorials"}'
```

**Option 2: Add to the seed file** (`prisma/seed.ts`) and run:
```bash
npx prisma db seed
```

## Project Structure

```
warp-cms/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── topics/        # Topic CRUD endpoints
│   │   │   ├── platforms/     # Platform endpoints
│   │   │   ├── categories/    # Category endpoints
│   │   │   └── generate/      # AI generation endpoints
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Dashboard page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── providers/         # React Query provider
│   │   ├── TopicForm.tsx      # Form to create topics
│   │   ├── TopicCard.tsx      # Topic display card
│   │   └── GeneratedIdeas.tsx # AI ideas component
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── openai.ts          # OpenAI client
│   │   └── utils.ts           # Utility functions
│   └── types/
│       └── index.ts           # TypeScript types
├── .env                       # Environment variables
├── package.json               # Dependencies
└── README.md                  # This file
```

## API Endpoints

### Topics
- `GET /api/topics` - List all topics (supports filters: status, platformId, categoryId)
- `POST /api/topics` - Create a new topic
- `PATCH /api/topics/[id]` - Update a topic
- `DELETE /api/topics/[id]` - Delete a topic

### Platforms
- `GET /api/platforms` - List all platforms
- `POST /api/platforms` - Create a new platform

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category

### AI Generation
- `GET /api/generate` - Get all generated ideas
- `POST /api/generate` - Generate new content ideas (requires OpenAI API key)
- `POST /api/generate/[id]/accept` - Accept a generated idea and create a topic

## Database Schema

```prisma
model Platform {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
  topics    Topic[]
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
  topics    Topic[]
}

model Topic {
  id          String   @id @default(cuid())
  title       String
  description String?
  platformId  String
  platform    Platform @relation(...)
  categoryId  String
  category    Category @relation(...)
  status      String   @default("NOT_STARTED")
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  completedAt DateTime?
}

model GeneratedIdea {
  id                  String    @id @default(cuid())
  content             String
  suggestedPlatformId String?
  suggestedCategoryId String?
  isAccepted          Boolean   @default(false)
  createdAt           DateTime  @default(now())
  acceptedAsTopicId   String?   @unique
}
```

## Development

### Running Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm start
```

### Database Commands
```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database
npx prisma migrate reset --force

# Create a new migration
npx prisma migrate dev --name description
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite database connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI generation | No |

## Future Enhancements

- [ ] User authentication
- [ ] Multiple content calendars/workspaces
- [ ] Content scheduling
- [ ] Analytics and insights
- [ ] Export to CSV/JSON
- [ ] Rich text editor for descriptions
- [ ] Image attachments
- [ ] Collaboration features
- [ ] Deploy to production (Vercel/Railway)

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
