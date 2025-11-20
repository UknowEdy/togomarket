require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

/**
 * Script pour créer les comptes staff de TogoMarket
 *
 * Utilisation:
 * node src/scripts/seedStaff.js
 */

const staffAccounts = [
  {
    fullName: 'Super Admin TogoMarket',
    phone: '+22890000001',
    email: 'edemkukuz+admin@gmail.com',
    password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@2024!',
    city: 'Lomé',
    district: 'Centre-ville',
    role: 'superadmin',
    isPhoneVerified: true,
    isEmailVerified: true,
    isIdentityVerified: true,
    isActive: true,
    bio: 'Super Administrateur - Accès complet à toutes les fonctionnalités'
  },
  {
    fullName: 'Support Client TogoMarket',
    phone: '+22890000002',
    email: 'edemkukuz+client@gmail.com',
    password: process.env.STAFF_PASSWORD || 'Staff@2024!',
    city: 'Lomé',
    district: 'Nyékonakpoè',
    role: 'staff',
    isPhoneVerified: true,
    isEmailVerified: true,
    isIdentityVerified: true,
    isActive: true,
    bio: 'Équipe support client - Assistance utilisateurs'
  },
  {
    fullName: 'TogoMarket Notifications',
    phone: '+22890000003',
    email: 'edemkukuz+noreply@gmail.com',
    password: process.env.NOREPLY_PASSWORD || 'NoReply@2024!',
    city: 'Lomé',
    district: 'Agoè',
    role: 'staff',
    isPhoneVerified: true,
    isEmailVerified: true,
    isActive: true,
    bio: 'Compte système pour envoi d\'emails et notifications automatiques'
  },
  {
    fullName: 'Utilisateur Test',
    phone: '+22890000004',
    email: 'edemkukuz+test@gmail.com',
    password: process.env.TEST_PASSWORD || 'Test@2024!',
    city: 'Kara',
    district: 'Centre',
    role: 'user',
    isPhoneVerified: true,
    isEmailVerified: true,
    isIdentityVerified: true,
    isActive: true,
    bio: 'Compte de test pour validation des fonctionnalités'
  }
];

const seedStaff = async () => {
  try {
    console.log('🌱 Démarrage du seed des comptes staff...\n');

    // Connexion à la base de données
    await connectDB();

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const account of staffAccounts) {
      try {
        // Vérifier si le compte existe déjà (par email ou téléphone)
        const existingUser = await User.findOne({
          $or: [
            { email: account.email },
            { phone: account.phone }
          ]
        });

        if (existingUser) {
          // Mettre à jour le rôle si nécessaire
          if (existingUser.role !== account.role) {
            existingUser.role = account.role;
            existingUser.isPhoneVerified = true;
            existingUser.isEmailVerified = true;
            await existingUser.save();
            console.log(`✅ ${account.fullName} (${account.email}) - Rôle mis à jour: ${account.role}`);
            updated++;
          } else {
            console.log(`⏭️  ${account.fullName} (${account.email}) - Déjà existant`);
            skipped++;
          }
        } else {
          // Créer le nouveau compte
          const user = await User.create(account);
          console.log(`✅ ${account.fullName} (${account.email}) - Créé avec rôle: ${account.role}`);
          created++;
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${account.email}:`, error.message);
      }
    }

    console.log('\n📊 Résumé du seed:');
    console.log(`   - Créés: ${created}`);
    console.log(`   - Mis à jour: ${updated}`);
    console.log(`   - Ignorés: ${skipped}`);
    console.log(`   - Total: ${created + updated + skipped}`);

    console.log('\n📝 Informations de connexion:');
    console.log('┌──────────────────────────────────────────────────────────────┐');
    console.log('│ ADMIN                                                        │');
    console.log('├──────────────────────────────────────────────────────────────┤');
    console.log(`│ Email: edemkukuz+admin@gmail.com                             │`);
    console.log(`│ Tel: +22890000001                                            │`);
    console.log(`│ Pass: ${process.env.ADMIN_PASSWORD || 'Admin@2024!'.padEnd(50)} │`);
    console.log('├──────────────────────────────────────────────────────────────┤');
    console.log('│ SUPPORT CLIENT                                               │');
    console.log('├──────────────────────────────────────────────────────────────┤');
    console.log(`│ Email: edemkukuz+client@gmail.com                            │`);
    console.log(`│ Tel: +22890000002                                            │`);
    console.log(`│ Pass: ${process.env.STAFF_PASSWORD || 'Staff@2024!'.padEnd(50)} │`);
    console.log('├──────────────────────────────────────────────────────────────┤');
    console.log('│ TEST USER                                                    │');
    console.log('├──────────────────────────────────────────────────────────────┤');
    console.log(`│ Email: edemkukuz+test@gmail.com                              │`);
    console.log(`│ Tel: +22890000004                                            │`);
    console.log(`│ Pass: ${process.env.TEST_PASSWORD || 'Test@2024!'.padEnd(50)} │`);
    console.log('└──────────────────────────────────────────────────────────────┘');

    console.log('\n✨ Seed terminé avec succès!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
};

// Exécuter le seed
seedStaff();
