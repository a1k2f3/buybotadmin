"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X } from 'lucide-react';

// Helper for file validation
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileSchema = z
    .any()
    .optional()
    .refine(files => !files || files.length === 0 || files?.[0]?.size <= 5 * 1024 * 1024, `Max image size is 5MB.`)
    .refine(files => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), "Only .jpg, .jpeg, .png and .webp formats are supported.");

const categorySchema = z.object({
    name: z.string().min(2, 'Category name is required'),
    description: z.string().optional(),
    parentCategory: z.string().optional(), // This will be the _id
    image: fileSchema,
});

type CategoryFormData = z.infer<typeof categorySchema>;

type Category = {
    _id: string;
    name: string;
    children: Category[];
};

export default function CreateCategory() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            description: '',
            parentCategory: '',
        }
    });

    const watchedImage = watch('image');

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/tree`);
                const result = await response.json();
                if (result.success) {
                    setCategories(result.data);
                } else {
                    console.error('Failed to load categories');
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Update image preview when file changes
    useEffect(() => {
        if (watchedImage && watchedImage.length > 0) {
            const file = watchedImage[0];
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [watchedImage]);

    // Recursive function to render nested options
    const renderCategoryOptions = (cats: Category[], level: number = 0) => {
        return cats.map(cat => (
            <React.Fragment key={cat._id}>
                <option value={cat._id}>
                    {'—'.repeat(level)} {cat.name}
                </option>
                {cat.children && cat.children.length > 0 && renderCategoryOptions(cat.children, level + 1)}
            </React.Fragment>
        ));
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setValue('image', e.dataTransfer.files);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setValue('image', e.target.files);
        }
    };

    const removeImage = () => {
        setValue('image', null);
        setPreviewUrl(null);
    };

    const onSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');

        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.parentCategory) formData.append('parentCategory', data.parentCategory);

        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]);
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! Status: ${response.status}`);
            }

            setSuccessMessage('Category created successfully!');
            reset();
            setPreviewUrl(null);
        } catch (err: any) {
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
                        </div>

                        <div>
                            <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700">Parent Category (Optional)</label>
                            <select 
                                id="parentCategory"
                                {...register('parentCategory')}
                                disabled={loadingCategories}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                            >
                                <option value="">-- No Parent (Root Category) --</option>
                                {loadingCategories ? (
                                    <option>Loading...</option>
                                ) : (
                                    renderCategoryOptions(categories)
                                )}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Select a parent to create a subcategory (nested with dashes).</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category Image (Optional)</label>
                            <div
                                className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">
                                    Drag & drop an image here, or click to select
                                </p>
                                <input 
                                    type="file" 
                                    {...register('image')}
                                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-input"
                                />
                                <label 
                                    htmlFor="file-input"
                                    className="mt-4 inline-block cursor-pointer text-indigo-600 hover:text-indigo-500"
                                >
                                    Choose file
                                </label>
                            </div>

                            {previewUrl && (
                                <div className="mt-4 relative max-w-xs">
                                    <img src={previewUrl} alt="Preview" className="rounded-lg object-cover w-full h-64" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            )}

                            {errors.image && <p className="text-red-500 text-xs mt-1">{typeof errors.image.message === 'string' ? errors.image.message : 'Invalid image'}</p>}
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