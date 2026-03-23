import { HeroSection } from '@/components/home/HeroSection';
import { CategoryStrip } from '@/components/home/CategoryStrip';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BestSellers } from '@/components/home/BestSellers';
import { AboutBrand } from '@/components/home/AboutBrand';
import { RecentlyViewed } from '@/components/home/RecentlyViewed';
import { Testimonials } from '@/components/home/Testimonials';
import { FAQ } from '@/components/home/FAQ';
import { Newsletter } from '@/components/home/Newsletter';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryStrip />
      <FeaturedProducts />
      <BestSellers />
      <AboutBrand />
      <RecentlyViewed />
      <Testimonials />
      <FAQ />
      <Newsletter />
    </>
  );
}
