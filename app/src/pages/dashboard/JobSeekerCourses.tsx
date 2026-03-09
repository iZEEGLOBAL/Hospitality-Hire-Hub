import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function JobSeekerCourses() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses enrolled</h3>
          <p className="text-gray-600">Browse our courses and start learning today</p>
        </CardContent>
      </Card>
    </div>
  );
}
