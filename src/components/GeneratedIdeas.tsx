'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GeneratedIdea } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export function GeneratedIdeas() {
  const queryClient = useQueryClient();

  const { data: ideas = [], isLoading } = useQuery<GeneratedIdea[]>({
    queryKey: ['generated-ideas'],
    queryFn: async () => {
      const res = await fetch('/api/generate');
      if (!res.ok) throw new Error('Failed to fetch generated ideas');
      return res.json();
    },
  });

  const generateIdeas = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate ideas');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-ideas'] });
    },
  });

  const acceptIdea = useMutation({
    mutationFn: async (ideaId: string) => {
      const res = await fetch(`/api/generate/${ideaId}/accept`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to accept idea');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Generated Ideas</h2>
        <Button
          onClick={() => generateIdeas.mutate()}
          disabled={generateIdeas.isPending}
        >
          {generateIdeas.isPending ? 'Generating...' : 'Generate Ideas'}
        </Button>
      </div>

      {generateIdeas.isError && (
        <Card className="border-red-500">
          <CardContent className="py-4 text-red-600">
            {generateIdeas.error instanceof Error
              ? generateIdeas.error.message
              : 'Failed to generate ideas'}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-gray-500">Loading generated ideas...</p>
      ) : ideas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No generated ideas yet. Click "Generate Ideas" to create some!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ideas.map((idea) => {
            const [title, ...descriptionParts] = idea.content.split('\n\n');
            const description = descriptionParts.join('\n\n');

            return (
              <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    {idea.suggestedPlatform && (
                      <Badge variant="secondary">
                        {idea.suggestedPlatform.name}
                      </Badge>
                    )}
                    {idea.suggestedCategory && (
                      <Badge variant="outline">
                        {idea.suggestedCategory.name}
                      </Badge>
                    )}
                    <Badge className="bg-purple-500">AI Generated</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-wrap">
                      {description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 mb-4">
                    Generated: {format(new Date(idea.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                  <Button
                    onClick={() => acceptIdea.mutate(idea.id)}
                    disabled={acceptIdea.isPending}
                    size="sm"
                  >
                    {acceptIdea.isPending ? 'Accepting...' : 'Accept & Add to Topics'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
