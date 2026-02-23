'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Topic } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface TopicCardProps {
  topic: Topic;
}

export function TopicCard({ topic }: TopicCardProps) {
  const queryClient = useQueryClient();

  const updateTopic = useMutation({
    mutationFn: async (data: Partial<Topic>) => {
      const res = await fetch(`/api/topics/${topic.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update topic');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });

  const deleteTopic = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/topics/${topic.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete topic');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });

  const toggleStatus = () => {
    const newStatus = topic.status === 'NOT_STARTED' ? 'COMPLETED' : 'NOT_STARTED';
    updateTopic.mutate({ status: newStatus });
  };

  const togglePublished = () => {
    updateTopic.mutate({ isPublished: !topic.isPublished });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{topic.title}</CardTitle>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteTopic.mutate()}
            disabled={deleteTopic.isPending}
          >
            Delete
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">{topic.platform.name}</Badge>
          <Badge variant="outline">{topic.category.name}</Badge>
          {topic.status === 'COMPLETED' && (
            <Badge variant="default">Completed</Badge>
          )}
          {topic.isPublished && (
            <Badge className="bg-green-500">Published</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {topic.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {topic.description}
          </p>
        )}
        <div className="text-xs text-gray-500 mb-4">
          Created: {format(new Date(topic.createdAt), 'MMM d, yyyy')}
          {topic.completedAt && (
            <span className="ml-2">
              • Completed: {format(new Date(topic.completedAt), 'MMM d, yyyy')}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={topic.status === 'COMPLETED' ? 'outline' : 'default'}
            size="sm"
            onClick={toggleStatus}
            disabled={updateTopic.isPending}
          >
            {topic.status === 'COMPLETED' ? 'Mark Incomplete' : 'Mark Complete'}
          </Button>
          <Button
            variant={topic.isPublished ? 'outline' : 'secondary'}
            size="sm"
            onClick={togglePublished}
            disabled={updateTopic.isPending}
          >
            {topic.isPublished ? 'Unpublish' : 'Mark Published'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
