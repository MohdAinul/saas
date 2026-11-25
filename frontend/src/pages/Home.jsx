import CTABanner from "../components/CTABanner";
import Features from "../components/Features";
import Hero from "../components/Hero";

const Home = () => {
  return (
    <div className="bg-page">
      <Hero />
      <Features />
      <CTABanner />
    </div>
  );
};

export default Home;
