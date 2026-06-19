
import NavBar from './component/NavBar';
import HeroSection from './component/HeroSection';
import ArticleSection from './component/ArticleSection';
import Footer from './component/Footer';

function App() {
  return (
    <>
      <main className="w-full max-w-[1200px] mx-auto px-6 pt-10 pb-12 flex flex-col gap-12 flex-grow" id="main-content">
        <NavBar />
        <HeroSection />
        <ArticleSection />
      </main>
      <Footer />
    </>
  );
}

export default App;

