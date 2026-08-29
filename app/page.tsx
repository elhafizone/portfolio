import { AboutSection } from '@/components/about/AboutSection';
import { ContactSection } from '@/components/contact/ContactSection';
import { ExperienceSection } from '@/components/experience/ExperienceSection';
import { ExpertiseSection } from '@/components/expertise/ExpertiseSection';
import { ToolsSection } from '@/components/expertise/ToolsSection';
import { Hero } from '@/components/hero/Hero';
import { ProcessSection } from '@/components/process/ProcessSection';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { ServicesSection } from '@/components/services/ServicesSection';
import { TestimonialsSection } from '@/components/testimonials/TestimonialsSection';

/**
 * Section order follows the hierarchy the site is arguing for:
 * work first, then expertise, then credibility, then personality, then contact.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ProjectsSection />
      <ServicesSection />
      <ExpertiseSection />
      <ToolsSection />
      <ExperienceSection />
      <ProcessSection />
      <TestimonialsSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
