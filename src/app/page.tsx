import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Guides from "@/components/Guides";
import Hero from "@/components/Hero";
import How from "@/components/How";
import Nav from "@/components/Nav";
import Survey from "@/components/Survey";
import Why from "@/components/Why";

/**
 * vrum.by landing page.
 *
 * Sections are composed in the same DOM order as the design prototype
 * (`vrum-landing.html`): Nav, Hero, How, Why, Survey, Final CTA, Footer.
 */
export default function Home() {
  return (
    <>
      <div id="top" />
      <Nav />
      <main>
        <Hero />
        <How />
        <Why />
        <Guides />
        <Survey />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
