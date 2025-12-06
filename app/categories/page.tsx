// app/admin/categories/create/page.tsx
"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Helper function for Zod to validate FileList (optional/required file uploads)
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileSchema = z
    .any()
    .optional() // Making the whole file field optional
    .refine(files => !files || files.length === 0 || files?.[0]?.size <= 5 * 1024 * 1024, `Max image size is 5MB.`) // Check file size (5MB limit)
    .refine(files => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), "Only .jpg, .jpeg, .png and .webp formats are supported."); // Check file type

// Zod schema for category, combined with image validation
const categorySchema = z.object({
    name: z.string().min(2, 'Category name is required'),
    description: z.string().optional(),
    parentCategory: z.string().optional(),
    // Add the image field to the schema and apply the file validation
    image: fileSchema,
});

// The type inference now correctly includes all fields
type CategoryFormData = z.infer<typeof categorySchema>;

export default function CreateCategory() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: { // Add default values for better type safety
            name: '',
            description: '',
            parentCategory: '',
        }
    });

    const onSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');

        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.parentCategory) formData.append('parentCategory', data.parentCategory);

        // Append the file if it exists and passes client-side validation
        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]);
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}`/api/categories``, {
                method: 'POST',
                // IMPORTANT: Do NOT set Content-Type header when using FormData with a file.
                // The browser sets it automatically to 'multipart/form-data' along with the boundary.
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                // Use the error message from the server response if available
                throw new Error(result.message || `HTTP error! Status: ${response.status}`);
            }

            setSuccessMessage('Category created successfully!');
            reset();
        } catch (err: any) {
            // Ensure the error message is handled correctly
            setErrorMessage(err.message || 'Something went wrong. Check server logs.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900">Create Category</h1>
                    <p className="mt-3 text-lg text-gray-600">
                        Add a new category to the system
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
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name *</label>
                            <input 
                                id="name"
                                {...register('name')} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" 
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea 
                                id="description"
                                {...register('description')} 
                                rows={4} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                            ></textarea>
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700">Parent Category ID (Optional)</label>
                            <input 
                                id="parentCategory"
                                {...register('parentCategory')} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" 
                            />
                            {errors.parentCategory && <p className="text-red-500 text-xs mt-1">{errors.parentCategory.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Category Image (Optional)</label>
                            <input 
                                id="image"
                                type="file" 
                                {...register('image')} 
                                accept={ACCEPTED_IMAGE_TYPES.join(',')} // Use accepted types from the schema
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                            />
                            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Creating Category...' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}