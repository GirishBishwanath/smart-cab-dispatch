import Hero from "../components/Hero.jsx";
import PortalCards from "../components/PortalCards.jsx";
import FeatureGrid from "../components/FeatureGrid.jsx";
import Workflow from "../components/Workflow.jsx";
import CTA from "../components/CTA.jsx";

const Home = () => {
  return (
    <>
      <Hero />
      <PortalCards />
      <FeatureGrid />
      <Workflow />
      <CTA />
    </>
  );
};

export default Home;