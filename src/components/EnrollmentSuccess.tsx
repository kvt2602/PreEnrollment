import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Download, Home } from 'lucide-react';
import { format } from 'date-fns';

interface EnrollmentSuccessProps {
  data: any;
  onReset: () => void;
}

export function EnrollmentSuccess({ data, onReset }: EnrollmentSuccessProps) {
  const handleDownload = () => {
    const summary = `
CIHE PRE-ENROLLMENT APPLICATION SUMMARY
======================================

PERSONAL INFORMATION
-------------------
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
Date of Birth: ${data.dateOfBirth ? format(data.dateOfBirth, 'PPP') : 'N/A'}
Gender: ${data.gender}

ADDRESS INFORMATION
------------------
Street Address: ${data.address}
City: ${data.city}
State/Province: ${data.state}
ZIP/Postal Code: ${data.zipCode}
Country: ${data.country}

ACADEMIC INFORMATION
-------------------
Program: ${data.program}
Study Mode: ${data.studyMode}
Previous Education: ${data.previousEducation}
${data.gpa ? `GPA: ${data.gpa}` : ''}

EMERGENCY CONTACT
-----------------
Name: ${data.emergencyContact}
Phone: ${data.emergencyPhone}

${data.specialRequirements ? `SPECIAL REQUIREMENTS\n-------------------\n${data.specialRequirements}` : ''}

Application Date: ${format(new Date(), 'PPP')}
    `.trim();

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollment-application-${data.firstName}-${data.lastName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h1 className="text-green-900 mb-2">Application Submitted Successfully!</h1>
        <p className="text-gray-600">
          Thank you for submitting your pre-enrollment application
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
          <CardDescription>
            Review your submitted information below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-gray-900 mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="text-gray-500">Name</p>
                <p>{data.firstName} {data.lastName}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p>{data.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p>{data.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Date of Birth</p>
                <p>{data.dateOfBirth ? format(data.dateOfBirth, 'PPP') : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-gray-900 mb-3">Address</h3>
            <div className="text-gray-700">
              <p>{data.address}</p>
              <p>{data.city}, {data.state} {data.zipCode}</p>
              <p>{data.country}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-gray-900 mb-3">Academic Information</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="text-gray-500">Program</p>
                <p>{data.program}</p>
              </div>
              <div>
                <p className="text-gray-500">Study Mode</p>
                <p>{data.studyMode}</p>
              </div>
              <div>
                <p className="text-gray-500">Previous Education</p>
                <p className="capitalize">{data.previousEducation.replace('-', ' ')}</p>
              </div>
              {data.gpa && (
                <div>
                  <p className="text-gray-500">GPA</p>
                  <p>{data.gpa}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-gray-900 mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="text-gray-500">Name</p>
                <p>{data.emergencyContact}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p>{data.emergencyPhone}</p>
              </div>
            </div>
          </div>

          {data.specialRequirements && (
            <div className="border-t pt-6">
              <h3 className="text-gray-900 mb-3">Special Requirements</h3>
              <p className="text-gray-700">{data.specialRequirements}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-blue-900 mb-2">What's Next?</h3>
        <ul className="list-disc list-inside space-y-2 text-blue-800">
          <li>We will review your application within 3-5 business days</li>
          <li>You will receive an email confirmation at {data.email}</li>
          <li>Further instructions will be sent once your application is processed</li>
          <li>Please keep a copy of this application for your records</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <Button className="flex-1" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download Summary
        </Button>
        <Button variant="outline" className="flex-1" onClick={onReset}>
          <Home className="h-4 w-4 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );
}
