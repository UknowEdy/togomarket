import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, X, ChevronRight, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { categoriesAPI, listingsAPI } from '@/services/api';
import type { Category, City, CreateListingData } from '@/types';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { compressImage } from '@/utils/helpers';
import { DynamicFormFields } from '@/components/DynamicFormFields';
import { shouldHideField } from '@/config/categoryFields';

export const PublishListing = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<CreateListingData>();

  const selectedCategory = watch('category');
  const isFree = watch('isFree');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, citiesRes] = await Promise.all([
        categoriesAPI.getCategories(),
        categoriesAPI.getCities()
      ]);
      setCategories(categoriesRes.categories || []);
      setCities(citiesRes.cities || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (selectedImages.length + files.length > 8) {
      setError('Maximum 8 images autorisées');
      return;
    }

    setError('');

    try {
      // Compresser les images
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file, 1200, 0.8))
      );

      // Créer les previews
      const newPreviews = await Promise.all(
        compressedFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      setSelectedImages([...selectedImages, ...compressedFiles]);
      setImagePreviews([...imagePreviews, ...newPreviews]);
    } catch (error) {
      setError('Erreur lors du traitement des images');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateListingData) => {
    console.log('🚀 onSubmit APPELÉ !');
    console.log('📦 Données form:', data);
    console.log('🖼️ Images sélectionnées:', selectedImages.length);
    console.log('❌ Erreurs form:', errors);

    if (selectedImages.length === 0) {
      console.error('❌ Pas d\'image');
      setError('Veuillez ajouter au moins une image');
      setStep(3); // Retour à l'étape photos
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();

      // Ajouter les données textuelles de base
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      if (data.subcategory) formData.append('subcategory', data.subcategory);

      // Prix et négociation (si applicable)
      if (!shouldHideField(data.category, 'price')) {
        formData.append('price', data.price?.toString() || '0');
        formData.append('isNegotiable', data.isNegotiable ? 'true' : 'false');
      }
      formData.append('isFree', data.isFree ? 'true' : 'false');

      // État (si applicable)
      if (!shouldHideField(data.category, 'condition')) {
        formData.append('condition', data.condition);
      }

      // Localisation
      formData.append('city', data.city);
      if (data.district) formData.append('district', data.district);
      formData.append('isUrgent', data.isUrgent ? 'true' : 'false');

      // Status pending par défaut (en attente de validation admin)
      formData.append('status', 'pending');

      // Ajouter les images
      selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });

      console.log('📤 Envoi de la requête POST...');
      const response = await listingsAPI.createListing(formData);
      console.log('✅ Réponse reçue:', response);

      // Rediriger vers l'annonce créée
      navigate(`/listing/${response.listing?._id}`);
    } catch (error: any) {
      console.error('❌ Erreur API:', error);
      setError(error.response?.data?.message || 'Erreur lors de la publication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choisissez une catégorie</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setValue('category', category.id);
                    setStep(2);
                  }}
                  className={`p-6 border-2 rounded-lg transition-all hover:border-primary hover:shadow-md ${
                    selectedCategory === category.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {category.name}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        );

      case 2:
        return (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations de l'annonce</h2>

            {/* Message d'erreur global */}
            {error && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger text-danger rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Titre de l'annonce *"
                placeholder="Ex: iPhone 13 Pro Max 256GB"
                error={errors.title?.message}
                {...register('title', {
                  required: 'Le titre est requis',
                  minLength: { value: 10, message: 'Minimum 10 caractères' },
                  maxLength: { value: 80, message: 'Maximum 80 caractères' }
                })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={6}
                  placeholder="Décrivez votre article en détail..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  {...register('description', {
                    required: 'La description est requise',
                    minLength: { value: 20, message: 'Minimum 20 caractères' },
                    maxLength: { value: 1000, message: 'Maximum 1000 caractères' }
                  })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-danger">{errors.description.message}</p>
                )}
              </div>

              {/* Prix et négociation (masqué pour certaines catégories) */}
              {!shouldHideField(selectedCategory, 'price') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                          {...register('isFree')}
                        />
                        <span className="text-sm font-medium text-gray-700">Article gratuit</span>
                      </label>
                    </div>
                  </div>

                  {!isFree && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Prix (FCFA) *"
                        type="number"
                        placeholder="50000"
                        error={errors.price?.message}
                        {...register('price', {
                          required: !isFree && 'Le prix est requis',
                          min: { value: 0, message: 'Prix invalide' }
                        })}
                      />

                      {!shouldHideField(selectedCategory, 'isNegotiable') && (
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer pb-2">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                              {...register('isNegotiable')}
                            />
                            <span className="text-sm font-medium text-gray-700">Négociable</span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* État (masqué pour certaines catégories) */}
              {!shouldHideField(selectedCategory, 'condition') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    État *
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    {...register('condition', { required: "L'état est requis" })}
                  >
                    <option value="">Sélectionnez l'état</option>
                    <option value="new">Neuf</option>
                    <option value="excellent">Excellent état</option>
                    <option value="good">Bon état</option>
                    <option value="acceptable">État acceptable</option>
                  </select>
                  {errors.condition && (
                    <p className="mt-1 text-sm text-danger">{errors.condition.message}</p>
                  )}
                </div>
              )}

              {/* Champs spécifiques à la catégorie */}
              <DynamicFormFields
                category={selectedCategory}
                register={register}
                errors={errors}
              />

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>
                <Button type="button" onClick={() => setStep(3)} fullWidth>
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Photos</h2>

            {/* Zone d'upload */}
            <div className="mb-6">
              <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-medium mb-1">
                  Cliquez pour ajouter des photos
                </p>
                <p className="text-sm text-gray-500">
                  Maximum 8 photos • JPG, PNG, WebP
                </p>
              </label>
            </div>

            {/* Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-danger text-white rounded-full hover:bg-danger-dark transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded">
                        Photo principale
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger text-danger rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              <Button type="button" onClick={() => setStep(4)} fullWidth>
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        );

      case 4:
        return (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Localisation et Options</h2>

            {/* Message d'erreur global */}
            {error && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger text-danger rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  {...register('city', { required: 'La ville est requise' })}
                >
                  <option value="">Sélectionnez une ville</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="mt-1 text-sm text-danger">{errors.city.message}</p>
                )}
              </div>

              <Input
                label="Quartier (optionnel)"
                placeholder="Ex: Bè"
                {...register('district')}
              />

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Options</h3>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    {...register('isUrgent')}
                  />
                  <div>
                    <div className="font-medium text-gray-900">🚨 Annonce urgente</div>
                    <div className="text-sm text-gray-600">
                      Badge "URGENT" rouge pour plus de visibilité
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(3)}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publication en cours...' : 'Publier l\'annonce'}
                </Button>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Publier une annonce
          </h1>
          <p className="text-gray-600">
            Remplissez les informations pour créer votre annonce
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Catégorie</span>
            <span>Informations</span>
            <span>Photos</span>
            <span>Localisation</span>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {renderStep()}
        </form>
      </div>
    </div>
  );
};
