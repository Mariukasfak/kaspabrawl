/**
 * Character Creation Page
 */
import React from 'react';
import Layout from '../components/layout/Layout';
import CharacterCreation from '../components/fighter/CharacterCreation';
import { KaspaWalletAuthProvider } from '../components/blockchain/KaspaWalletAuth';

export default function CreateCharacterPage() {
  return (
    <KaspaWalletAuthProvider>
      <Layout>
        <CharacterCreation />
      </Layout>
    </KaspaWalletAuthProvider>
  );
}
