import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Calendar, CalendarDays, User, Phone, Mail, MapPin, FileText, Upload, CheckCircle, Building, Briefcase } from 'lucide-react';
import { submitApplicationToBackend } from '../utils/api';

const PersonalDataForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    nationality: '',
    dateOfBirth: '',
    countryCode: '',
    phoneNumber: '',
    email: '',
    hasQatarResidence: '',
    qatariIdNumber: '',
    qatariIdExpiry: '',
    passportNumber: '',
    passportExpiry: '',
    workedWithProtv: '',
    lastProjectName: '',
    preferredWorkTypes: [],
    position: '',
    files: {
      personalPhoto: null,
      idCopy: null,
      passportCopy: null,
      cv: null,
      portfolio: null
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const countryCodes = [
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' }
  ];

  const nationalities = [
    'Qatari', 'American', 'British', 'Canadian', 'Australian', 'German', 'French', 'Italian', 'Spanish', 
    'Japanese', 'Chinese', 'Indian', 'Pakistani', 'Bangladeshi', 'Sri Lankan', 'Nepalese', 'Filipino',
    'Egyptian', 'Jordanian', 'Lebanese', 'Syrian', 'Iraqi', 'Yemeni', 'Sudanese', 'Moroccan', 'Algerian', 'Tunisian',
    'Emirati', 'Saudi Arabian', 'Kuwaiti', 'Bahraini', 'Omani', 'Iranian', 'Afghan', 'Turkish',
    'Russian', 'Ukrainian', 'Polish', 'Romanian', 'Bulgarian', 'Czech', 'Hungarian', 'Croatian'
  ];

  const workTypes = [
    'Live sport event',
    'Social Media Coverages',
    'Studios and Program',
    'Documentaries',
    'ENG and News',
    'Promos',
    'Other'
  ];

  const positions = [
    'Camera Operator', 'Video Editor', 'Producer', 'Director', 'Sound Engineer',
    'Lighting Technician', 'Graphic Designer', 'Broadcaster/Presenter', 'Journalist',
    'Reporter', 'Photographer', 'Live Stream Operator', 'Technical Director',
    'Production Manager', 'Content Creator', 'Social Media Specialist', 
    'Motion Graphics Artist', 'Colorist', 'Audio Post-Production', 'Script Writer',
    'Researcher', 'Production Assistant', 'Floor Manager', 'Drone Pilot',
    'Video Analyst', 'Broadcast Engineer', 'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleWorkTypeChange = (workType, checked) => {
    setFormData(prev => ({
      ...prev,
      preferredWorkTypes: checked 
        ? [...prev.preferredWorkTypes, workType]
        : prev.preferredWorkTypes.filter(type => type !== workType)
    }));
  };

  const handleFileUpload = (fileType, file) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        files: {
          ...prev.files,
          [fileType]: file
        }
      }));
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded.`,
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.countryCode) newErrors.countryCode = 'Country code is required';
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        else if (!/^\d{7,15}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Phone number must be 7-15 digits';
        if (!formData.nationality) newErrors.nationality = 'Nationality is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        break;
      
      case 2:
        if (!formData.hasQatarResidence) newErrors.hasQatarResidence = 'Please select if you have Qatar residence';
        
        if (formData.hasQatarResidence === 'yes') {
          if (!formData.qatariIdNumber.trim()) newErrors.qatariIdNumber = 'Qatari ID number is required';
          else if (!/^\d{11}$/.test(formData.qatariIdNumber)) newErrors.qatariIdNumber = 'Qatari ID must be exactly 11 digits';
          if (!formData.qatariIdExpiry) newErrors.qatariIdExpiry = 'Qatari ID expiry date is required';
        }
        
        if (formData.hasQatarResidence === 'no') {
          if (!formData.passportNumber.trim()) newErrors.passportNumber = 'Passport number is required';
          if (!formData.passportExpiry) newErrors.passportExpiry = 'Passport expiry date is required';
        }
        break;
      
      case 3:
        if (!formData.workedWithProtv) newErrors.workedWithProtv = 'Please select if you worked with PROTV before';
        if (!formData.lastProjectName.trim()) newErrors.lastProjectName = 'Last project name is required';
        if (formData.preferredWorkTypes.length === 0) newErrors.preferredWorkTypes = 'Please select at least one work type';
        if (!formData.position) newErrors.position = 'Position is required';
        break;
      
      case 4:
        if (!formData.files.personalPhoto) newErrors.personalPhoto = 'Personal photo is required';
        if (!formData.files.idCopy) newErrors.idCopy = 'ID copy is required';
        if (!formData.files.passportCopy) newErrors.passportCopy = 'Passport copy is required';
        if (!formData.files.cv) newErrors.cv = 'CV is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await submitApplicationToBackend(formData);
      
      if (result.success) {
        setCurrentStep(5);
        toast({
          title: "Application submitted successfully!",
          description: "Your application has been submitted to PROTV.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Personal Information</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name (in ENGLISH as passport) *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Enter your full name as in passport"
            className={errors.fullName ? 'border-red-500' : ''}
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>
        
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <Label>Phone Number *</Label>
          <div className="flex gap-2">
            <Select value={formData.countryCode} onValueChange={(value) => handleInputChange('countryCode', value)}>
              <SelectTrigger className={`w-40 ${errors.countryCode ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.code} {country.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Mobile number"
                className={`pl-10 ${errors.phoneNumber ? 'border-red-500' : ''}`}
              />
            </div>
          </div>
          {errors.countryCode && <p className="text-red-500 text-sm mt-1">{errors.countryCode}</p>}
          {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
        </div>

        <div>
          <Label htmlFor="nationality">Nationality *</Label>
          <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
            <SelectTrigger className={errors.nationality ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your nationality" />
            </SelectTrigger>
            <SelectContent>
              {nationalities.map((nationality) => (
                <SelectItem key={nationality} value={nationality}>
                  {nationality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
        </div>
        
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className={`pl-10 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Residence & Documentation</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label>Do you have a valid residence in QATAR? *</Label>
          <RadioGroup 
            value={formData.hasQatarResidence} 
            onValueChange={(value) => handleInputChange('hasQatarResidence', value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>
          {errors.hasQatarResidence && <p className="text-red-500 text-sm mt-1">{errors.hasQatarResidence}</p>}
        </div>
        
        {formData.hasQatarResidence === 'yes' && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800">Qatar Residence Information</h4>
            <div>
              <Label htmlFor="qatariIdNumber">Qatari ID Number (11 digits) *</Label>
              <Input
                id="qatariIdNumber"
                value={formData.qatariIdNumber}
                onChange={(e) => handleInputChange('qatariIdNumber', e.target.value)}
                placeholder="Enter 11-digit Qatari ID number"
                maxLength="11"
                className={errors.qatariIdNumber ? 'border-red-500' : ''}
              />
              {errors.qatariIdNumber && <p className="text-red-500 text-sm mt-1">{errors.qatariIdNumber}</p>}
            </div>
            <div>
              <Label htmlFor="qatariIdExpiry">Qatari ID Expiry Date *</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="qatariIdExpiry"
                  type="date"
                  value={formData.qatariIdExpiry}
                  onChange={(e) => handleInputChange('qatariIdExpiry', e.target.value)}
                  className={`pl-10 ${errors.qatariIdExpiry ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.qatariIdExpiry && <p className="text-red-500 text-sm mt-1">{errors.qatariIdExpiry}</p>}
            </div>
          </div>
        )}
        
        {formData.hasQatarResidence === 'no' && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800">Passport Information</h4>
            <div>
              <Label htmlFor="passportNumber">Passport Number *</Label>
              <Input
                id="passportNumber"
                value={formData.passportNumber}
                onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                placeholder="Enter your passport number"
                className={errors.passportNumber ? 'border-red-500' : ''}
              />
              {errors.passportNumber && <p className="text-red-500 text-sm mt-1">{errors.passportNumber}</p>}
            </div>
            <div>
              <Label htmlFor="passportExpiry">Passport Expiry Date *</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="passportExpiry"
                  type="date"
                  value={formData.passportExpiry}
                  onChange={(e) => handleInputChange('passportExpiry', e.target.value)}
                  className={`pl-10 ${errors.passportExpiry ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.passportExpiry && <p className="text-red-500 text-sm mt-1">{errors.passportExpiry}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Briefcase className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Work Experience & Preferences</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label>Do you work before with PROTV? *</Label>
          <RadioGroup 
            value={formData.workedWithProtv} 
            onValueChange={(value) => handleInputChange('workedWithProtv', value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="protv-yes" />
              <Label htmlFor="protv-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="protv-no" />
              <Label htmlFor="protv-no">No</Label>
            </div>
          </RadioGroup>
          {errors.workedWithProtv && <p className="text-red-500 text-sm mt-1">{errors.workedWithProtv}</p>}
        </div>
        
        <div>
          <Label htmlFor="lastProjectName">Please write last project name *</Label>
          <Input
            id="lastProjectName"
            value={formData.lastProjectName}
            onChange={(e) => handleInputChange('lastProjectName', e.target.value)}
            placeholder="Enter your last project name"
            className={errors.lastProjectName ? 'border-red-500' : ''}
          />
          {errors.lastProjectName && <p className="text-red-500 text-sm mt-1">{errors.lastProjectName}</p>}
        </div>
        
        <div>
          <Label>Preferred work type *</Label>
          <div className="space-y-2 mt-2">
            {workTypes.map((workType) => (
              <div key={workType} className="flex items-center space-x-2">
                <Checkbox
                  id={workType}
                  checked={formData.preferredWorkTypes.includes(workType)}
                  onCheckedChange={(checked) => handleWorkTypeChange(workType, checked)}
                />
                <Label htmlFor={workType}>{workType}</Label>
              </div>
            ))}
          </div>
          {errors.preferredWorkTypes && <p className="text-red-500 text-sm mt-1">{errors.preferredWorkTypes}</p>}
        </div>
        
        <div>
          <Label htmlFor="position">Please select your position or Major *</Label>
          <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
            <SelectTrigger className={errors.position ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your position" />
            </SelectTrigger>
            <SelectContent>
              {positions.map((position) => (
                <SelectItem key={position} value={position}>
                  {position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
        </div>
      </div>
    </div>
  );

  const FileUploadCard = ({ title, description, fileType, accept, icon: Icon, error, required = true }) => (
    <Card className={`hover:shadow-md transition-shadow ${error ? 'border-red-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-base">{title} {required && '*'}</CardTitle>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileUpload(fileType, e.target.files[0])}
            className="hidden"
            id={fileType}
          />
          <label
            htmlFor={fileType}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Choose File
          </label>
          {formData.files[fileType] && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">{formData.files[fileType].name}</span>
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Document Upload</h3>
      </div>
      
      <div className="grid gap-4">
        <FileUploadCard
          title="Personal Photo"
          description="Upload a clear photo of yourself"
          fileType="personalPhoto"
          accept="image/*"
          icon={User}
          error={errors.personalPhoto}
        />
        
        <FileUploadCard
          title="ID Copy"
          description="Upload a clear copy of your ID (Qatar ID or National ID)"
          fileType="idCopy"
          accept="image/*,.pdf"
          icon={FileText}
          error={errors.idCopy}
        />
        
        <FileUploadCard
          title="Passport Copy"
          description="Upload a clear copy of your passport"
          fileType="passportCopy"
          accept="image/*,.pdf"
          icon={FileText}
          error={errors.passportCopy}
        />
        
        <FileUploadCard
          title="CV/Resume"
          description="Upload your current CV or resume"
          fileType="cv"
          accept=".pdf,.doc,.docx"
          icon={FileText}
          error={errors.cv}
        />
        
        <FileUploadCard
          title="Portfolio"
          description="Upload your portfolio (optional)"
          fileType="portfolio"
          accept=".pdf,.doc,.docx,.zip,.rar"
          icon={FileText}
          required={false}
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold text-green-600 mb-2">Application Submitted Successfully!</h3>
        <p className="text-gray-600">Your application has been submitted to PROTV and will be reviewed shortly.</p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">What's Next?</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Your application has been stored securely in our system</li>
          <li>• You will receive a confirmation email shortly</li>
          <li>• PROTV HR team will review your application within 3-5 business days</li>
          <li>• You'll be contacted if selected for an interview</li>
          <li>• Keep your documents ready for verification</li>
        </ul>
      </div>
      
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Reference ID: PROTV-{Date.now().toString(36).toUpperCase()}
      </Badge>
      
      <div className="flex items-center justify-center gap-2 mt-6">
        <Building className="h-5 w-5 text-blue-600" />
        <span className="text-sm text-gray-600">Thank you for your interest in PROTV</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">PROTV Application Form</h1>
          </div>
          <p className="text-gray-600">Please provide your information accurately and upload required documents</p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Step {currentStep} of {totalSteps}</h2>
              <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          
          <CardContent className="p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </CardContent>
          
          {currentStep < 5 && (
            <div className="flex justify-between p-6 pt-0">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PersonalDataForm;
