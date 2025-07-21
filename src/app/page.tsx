import MainLayout from "~/components/layout/main-layout"
import { HeroSection } from "~/components/hero-section"
import { Footer } from "~/components/footer"
import { AboutUsSection } from "~/components/about-us-section"

export default function HomePage() {
  return (
    <MainLayout>
      <div className="min-h-screen">
        <HeroSection />
        <AboutUsSection />
        <Footer />
      </div>
    </MainLayout>
  )
}
