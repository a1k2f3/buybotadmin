// components/RegisterStore.tsx
"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Zod schema matching your backend exactly
const storeSchema = z.object({
  name: z.string().min(2, 'Store name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  description: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  contactNumber: z.string().min(10, 'Valid contact number required'),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

type StoreFormData = z.infer<typeof storeSchema> & {
  logo?: FileList;
  cnicFront?: FileList;
  cnicBack?: FileList;
  businessLicense?: FileList;
  taxCertificate?: FileList;
  otherDocs?: FileList;
};

export default function RegisterStore() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
  });

  const totalSteps = 3; // Adjust based on steps

  const nextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(['name', 'ownerName', 'email', 'password']);
    } else if (currentStep === 2) {
      isValid = await trigger(['description', 'address', 'contactNumber', 'city', 'state', 'postalCode', 'country']);
    } else if (currentStep === 3) {
      isValid = true; // Files and social are optional
    }
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: StoreFormData) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    const formData = new FormData();

    // Append all text fields (flat, to match backend)
    Object.keys(data).forEach((key) => {
      if (!['logo', 'cnicFront', 'cnicBack', 'businessLicense', 'taxCertificate', 'otherDocs'].includes(key)) {
        formData.append(key, data[key as keyof Omit<StoreFormData, 'logo' | 'cnicFront' | 'cnicBack' | 'businessLicense' | 'taxCertificate' | 'otherDocs'>] as string || '');
      }
    });

    // Handle file uploads
    if (data.logo && data.logo.length > 0) {
      formData.append('logo', data.logo[0]);
    }
    if (data.cnicFront && data.cnicFront.length > 0) {
      formData.append('cnicFront', data.cnicFront[0]);
    }
    if (data.cnicBack && data.cnicBack.length > 0) {
      formData.append('cnicBack', data.cnicBack[0]);
    }
    if (data.businessLicense && data.businessLicense.length > 0) {
      formData.append('businessLicense', data.businessLicense[0]);
    }
    if (data.taxCertificate && data.taxCertificate.length > 0) {
      formData.append('taxCertificate', data.taxCertificate[0]);
    }
    if (data.otherDocs) {
      Array.from(data.otherDocs).forEach((file) => formData.append('otherDocs', file));
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/send-request`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      const result = await response.json();
      setSuccessMessage(`Request submitted successfully! Request ID: ${result.requestId || 'N/A'}`);
      reset();
      setCurrentStep(1);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-full mx-auto"> {/* Changed to max-w-full for whole page coverage */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Register Your Store</h1>
          <p className="mt-3 text-lg text-gray-600">
            Submit your store details for admin approval
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Pagination Indicator */}
            <div className="flex justify-center mb-6">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full mx-2 ${currentStep === index + 1 ? 'bg-indigo-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>

            {currentStep === 1 && (
              <>
                {/* Step 1: Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Store Name *</label>
                    <input {...register('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Owner Name *</label>
                    <input {...register('ownerName')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                    {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input type="email" {...register('email')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password *</label>
                    <input type="password" {...register('password')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                {/* Step 2: Description and Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Store Description</label>
                  <textarea {...register('description')} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"></textarea>
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Street Address *</label>
                    <input {...register('address')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input {...register('city')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input {...register('state')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input {...register('postalCode')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input {...register('country')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number *</label>
                    <input {...register('contactNumber')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                    {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>}
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                {/* Step 3: Social Links and File Uploads */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Social Media Links (Optional)</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <input {...register('facebook')} placeholder="https://facebook.com/yourstore" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                    <input {...register('instagram')} placeholder="https://instagram.com/yourstore" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                    <input {...register('website')} placeholder="https://www.yourstore.com" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Store Logo</label>
                    <input type="file" {...register('logo')} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">CNIC Front (PDF/Image)</label>
                    <input type="file" {...register('cnicFront')} accept=".pdf,image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">CNIC Back (PDF/Image)</label>
                    <input type="file" {...register('cnicBack')} accept=".pdf,image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business License (PDF/Image)</label>
                    <input type="file" {...register('businessLicense')} accept=".pdf,image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Certificate (PDF/Image)</label>
                    <input type="file" {...register('taxCertificate')} accept=".pdf,image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Other Documents (Multiple Allowed)</label>
                    <input type="file" {...register('otherDocs')} multiple accept=".pdf,.doc,.docx,image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>
                </div>
              </>
            )}

            <div className="pt-6 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Previous
                </button>
              )}
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  // disabled={isSubmitting}
                  className={`flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 $`}
                >
                  {isSubmitting ? 'Submitting Request...' : 'Submit Store Request'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}