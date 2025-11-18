import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Phone, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import type { LoginData } from '@/types';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginData>();

  const onSubmit = async (data: LoginData) => {
    setError('');
    setIsLoading(true);

    try {
      await login(data.phoneOrEmail, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
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
            Connexion
          </h2>
          <p className="text-gray-600 mt-2">
            Bienvenue sur TogoMarket 🇹🇬
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
              label="Téléphone ou Email"
              type="text"
              placeholder="+228 XX XX XX XX"
              icon={<Phone className="w-5 h-5" />}
              error={errors.phoneOrEmail?.message}
              {...register('phoneOrEmail', {
                required: 'Ce champ est requis'
              })}
            />

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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-gray-600">Se souvenir de moi</span>
              </label>

              <Link to="/forgot-password" className="text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Se connecter
            </Button>
          </form>

          {/* Inscription */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          En vous connectant, vous acceptez nos{' '}
          <Link to="/terms" className="text-primary hover:underline">
            Conditions d'utilisation
          </Link>
        </div>
      </div>
    </div>
  );
};
