/**
 * Index — Forsiden med hero, kategorier og seksjoner.
 * Bestillingen skjer nå via kategori-sider og produktsider.
 */
import { LandingSection } from '@/components/ordering/LandingSection';
import { HomeSections } from '@/components/ordering/HomeSections';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <LandingSection />
      <HomeSections />
    </div>
  );
}
