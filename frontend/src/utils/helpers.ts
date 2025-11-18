import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate un prix en FCFA
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price) + ' FCFA';
};

/**
 * Formate une date relative (Il y a 2h, Hier, etc.)
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: fr
    });
  } catch {
    return 'Date invalide';
  }
};

/**
 * Formate une date complète
 */
export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    return format(new Date(date), formatStr, { locale: fr });
  } catch {
    return 'Date invalide';
  }
};

/**
 * Formate un numéro de téléphone togolais
 */
export const formatPhoneNumber = (phone: string): string => {
  // Supprime tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');

  // Format: +228 XX XX XX XX
  if (cleaned.startsWith('228')) {
    const number = cleaned.substring(3);
    return `+228 ${number.substring(0, 2)} ${number.substring(2, 4)} ${number.substring(4, 6)} ${number.substring(6, 8)}`;
  }

  // Format: XX XX XX XX
  return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)}`;
};

/**
 * Tronque un texte avec ellipse
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Classe conditionnelle (comme clsx)
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Obtient le libellé de la condition
 */
export const getConditionLabel = (condition: string): string => {
  const labels: Record<string, string> = {
    new: 'Neuf',
    excellent: 'Excellent état',
    good: 'Bon état',
    acceptable: 'État acceptable'
  };
  return labels[condition] || condition;
};

/**
 * Obtient la couleur du badge de condition
 */
export const getConditionColor = (condition: string): string => {
  const colors: Record<string, string> = {
    new: 'bg-green-100 text-green-800',
    excellent: 'bg-blue-100 text-blue-800',
    good: 'bg-yellow-100 text-yellow-800',
    acceptable: 'bg-orange-100 text-orange-800'
  };
  return colors[condition] || 'bg-gray-100 text-gray-800';
};

/**
 * Génère une URL de partage WhatsApp
 */
export const getWhatsAppShareUrl = (text: string, url?: string): string => {
  const message = url ? `${text} - ${url}` : text;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};

/**
 * Compresse une image
 */
export const compressImage = async (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              reject(new Error('Erreur de compression'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = reject;
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Valide un numéro de téléphone togolais
 */
export const isValidTogolanesePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  // 8 chiffres ou +228 suivi de 8 chiffres
  return /^(\+?228)?[0-9]{8}$/.test(cleaned);
};
