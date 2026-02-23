'use client';

import { useQuery } from '@tanstack/react-query';
import { Topic } from '@/types';
import { TopicForm } from '@/components/TopicForm';
import { TopicCard } from '@/components/TopicCard';
import { GeneratedIdeas } from '@/components/GeneratedIdeas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const { data: topics = [], isLoading } = useQuery<Topic[]>({
    queryKey: ['topics'],
    queryFn: async () => {
      const res = await fetch('/api/topics');
      if (!res.ok) throw new Error('Failed to fetch topics');
      return res.json();
    },
  });

  const pendingTopics = topics.filter((t) => t.status === 'NOT_STARTED');
  const completedTopics = topics.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Content Management System
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and generate content ideas across multiple social platforms
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{topics.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{pendingTopics.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{completedTopics.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topic Form */}
          <div className="lg:col-span-1">
            <TopicForm />
          </div>

          {/* Topics Lists */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Topics */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Pending Topics</h2>
              {isLoading ? (
                <p className="text-gray-500">Loading topics...</p>
              ) : pendingTopics.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No pending topics. Create one to get started!
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pendingTopics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Topics */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Completed Topics</h2>
              {isLoading ? (
                <p className="text-gray-500">Loading topics...</p>
              ) : completedTopics.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No completed topics yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {completedTopics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              )}
            </div>

            {/* Generated Ideas */}
            <div>
              <GeneratedIdeas />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
