import { Link } from 'react-router-dom';
import { PlusCircle, User, LogOut, Heart, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from './Button';
import { SearchBar } from './SearchBar';

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              TM
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-gray-900">
                TogoMarket
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Acheter & Vendre au Togo 🇹🇬
              </p>
            </div>
          </Link>

          {/* Barre de recherche (desktop) */}
          <SearchBar className="hidden md:flex flex-1 max-w-xl mx-8" />

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Publier une annonce */}
                <Link to="/publish">
                  <Button variant="primary" size="sm" className="hidden sm:flex">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Publier
                  </Button>
                </Link>

                {/* Messages */}
                <Link to="/messages" className="p-2 hover:bg-gray-100 rounded-lg relative">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
                </Link>

                {/* Favoris */}
                <Link to="/favorites" className="p-2 hover:bg-gray-100 rounded-lg">
                  <Heart className="w-5 h-5 text-gray-600" />
                </Link>

                {/* Menu utilisateur */}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                    {user?.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.fullName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-sm text-gray-500">{user?.phone}</p>
                    </div>

                    <div className="p-2">
                      <Link to="/profile" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg">
                        <User className="w-4 h-4" />
                        Mon profil
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-danger"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Connexion
                  </Button>
                </Link>

                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Barre de recherche (mobile) */}
        <SearchBar className="md:hidden pb-3" />
      </div>
    </header>
  );
};
