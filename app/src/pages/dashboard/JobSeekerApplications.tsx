import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function JobSeekerApplications() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600">Start applying to jobs to see them here</p>
        </CardContent>
      </Card>
    </div>
  );
}
