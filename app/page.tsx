import {
  Header,
  HeroSection,
  FeaturesSection,
  ProcessSection,
  StylesShowcase,
  AgeGroupsSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProcessSection />
        <StylesShowcase />
        <AgeGroupsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
