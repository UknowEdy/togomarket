import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Phone, Mail, Lock, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import type { RegisterData } from '@/types';

const CITIES = ['Lomé', 'Kara', 'Sokodé', 'Kpalimé', 'Atakpamé', 'Bassar', 'Tsévié', 'Aného', 'Dapaong', 'Tchamba', 'Autre'];

export const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterData) => {
    setError('');
    setIsLoading(true);

    try {
      await registerUser(data);
      navigate('/verify-phone');
    } catch (err: any) {
      setError(err.message || "Erreur d'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl">
              TM
            </div>
          </Link>
          <h2 className="text-3xl font-display font-bold text-gray-900">
            Inscription
          </h2>
          <p className="text-gray-600 mt-2">
            Créez votre compte TogoMarket
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger text-danger rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nom complet"
              type="text"
              placeholder="Ex: Jean Dupont"
              icon={<User className="w-5 h-5" />}
              error={errors.fullName?.message}
              {...register('fullName', {
                required: 'Le nom est requis',
                minLength: {
                  value: 3,
                  message: 'Minimum 3 caractères'
                }
              })}
            />

            <Input
              label="Numéro de téléphone"
              type="tel"
              placeholder="+228 XX XX XX XX"
              icon={<Phone className="w-5 h-5" />}
              error={errors.phone?.message}
              {...register('phone', {
                required: 'Le numéro de téléphone est requis',
                pattern: {
                  value: /^(\+?228)?[0-9]{8}$/,
                  message: 'Numéro togolais invalide'
                }
              })}
            />

            <Input
              label="Email (optionnel)"
              type="email"
              placeholder="exemple@email.com"
              icon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email', {
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Email invalide'
                }
              })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  {...register('city', { required: 'La ville est requise' })}
                >
                  <option value="">Sélectionnez une ville</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              {errors.city && (
                <p className="mt-1 text-sm text-danger">{errors.city.message}</p>
              )}
            </div>

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register('password', {
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 6,
                  message: 'Minimum 6 caractères'
                }
              })}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              S'inscrire
            </Button>
          </form>

          {/* Connexion */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          En vous inscrivant, vous acceptez nos{' '}
          <Link to="/terms" className="text-primary hover:underline">
            Conditions d'utilisation
          </Link>
        </div>
      </div>
    </div>
  );
};
