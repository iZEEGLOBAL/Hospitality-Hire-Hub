import { Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function JobSeekerInterview() {
  const departments = [
    { id: 'front_office', name: 'Front Office', icon: '👋', description: 'Reception, Guest Services, Reservations' },
    { id: 'housekeeping', name: 'Housekeeping', icon: '🧹', description: 'Room Attendants, Laundry, Public Areas' },
    { id: 'kitchen', name: 'Kitchen', icon: '👨‍🍳', description: 'Chefs, Cooks, Prep Staff' },
    { id: 'food_beverage', name: 'Food & Beverage', icon: '🍽️', description: 'Restaurant, Bar, Room Service' },
    { id: 'management', name: 'Management', icon: '💼', description: 'General Manager, Department Heads' },
    { id: 'maintenance', name: 'Maintenance', icon: '🔧', description: 'Engineering, Repairs, Facilities' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certification Interview</h1>
        <p className="text-gray-600 mt-1">
          Take our professional certification to stand out to employers
        </p>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Get Certified</h3>
              <p className="text-gray-600">
                Pass the interview to become a certified candidate and get noticed by employers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">{dept.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{dept.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{dept.description}</p>
              <Button variant="outline" className="w-full">
                Start Interview
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
