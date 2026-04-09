import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface EnrollmentFormProps {
  onSubmit: (data: any) => void;
}

const PROGRAMS = [
  'Computer Science',
  'Information Technology',
  'Business Administration',
  'Engineering',
  'Medicine',
  'Psychology',
  'Economics',
  'Arts & Design',
];

const STUDY_MODES = ['Full-time', 'Part-time', 'Online'];

export function EnrollmentForm({ onSubmit }: EnrollmentFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: undefined as Date | undefined,
    gender: '',
    
    // Address Information
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Academic Information
    program: '',
    studyMode: '',
    previousEducation: '',
    gpa: '',
    
    // Additional Information
    emergencyContact: '',
    emergencyPhone: '',
    specialRequirements: '',
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && 
               formData.phone && formData.dateOfBirth && formData.gender;
      case 2:
        return formData.address && formData.city && formData.state && 
               formData.zipCode && formData.country;
      case 3:
        return formData.program && formData.studyMode && formData.previousEducation;
      case 4:
        return formData.emergencyContact && formData.emergencyPhone;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps) {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-blue-900 mb-2">Student Pre-Enrollment</h1>
        <p className="text-gray-600">Complete the form to submit your enrollment application</p>
      </div>

      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-gray-600">
          <span className={step >= 1 ? 'text-blue-600' : ''}>Personal Info</span>
          <span className={step >= 2 ? 'text-blue-600' : ''}>Address</span>
          <span className={step >= 3 ? 'text-blue-600' : ''}>Academic</span>
          <span className={step >= 4 ? 'text-blue-600' : ''}>Emergency</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Personal Information'}
            {step === 2 && 'Address Information'}
            {step === 3 && 'Academic Information'}
            {step === 4 && 'Emergency Contact'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Please provide your personal details'}
            {step === 2 && 'Enter your current residential address'}
            {step === 3 && 'Tell us about your academic background and preferences'}
            {step === 4 && 'Provide emergency contact information'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="student@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left ${!formData.dateOfBirth && 'text-gray-400'}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateOfBirth ? format(formData.dateOfBirth, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dateOfBirth}
                      onSelect={(date) => updateField('dateOfBirth', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => updateField('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateField('zipCode', e.target.value)}
                    placeholder="10001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program">Program of Study *</Label>
                <Select value={formData.program} onValueChange={(value) => updateField('program', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((program) => (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studyMode">Study Mode *</Label>
                <Select value={formData.studyMode} onValueChange={(value) => updateField('studyMode', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select study mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDY_MODES.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousEducation">Highest Education Level *</Label>
                <Select 
                  value={formData.previousEducation} 
                  onValueChange={(value) => updateField('previousEducation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="associate">Associate Degree</SelectItem>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="doctorate">Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gpa">Previous GPA (Optional)</Label>
                <Input
                  id="gpa"
                  value={formData.gpa}
                  onChange={(e) => updateField('gpa', e.target.value)}
                  placeholder="3.5"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => updateField('emergencyContact', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => updateField('emergencyPhone', e.target.value)}
                  placeholder="+1 (555) 987-6543"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequirements">Special Requirements or Accommodations (Optional)</Label>
                <textarea
                  id="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={(e) => updateField('specialRequirements', e.target.value)}
                  placeholder="Please describe any special requirements or accommodations you may need..."
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-blue-900">
                    <p className="mb-2">By submitting this form, you confirm that:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>All information provided is accurate and complete</li>
                      <li>You agree to the institution's terms and conditions</li>
                      <li>You understand this is a pre-enrollment application</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep()}
              >
                Submit Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}