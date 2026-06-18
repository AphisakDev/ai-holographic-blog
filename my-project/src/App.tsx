
import NavBar from './component/NavBar';
import HeroSection from './component/HeroSection';
import ArticleSection from './component/ArticleSection';
import Footer from './component/Footer';
import './App.css';

function App() {
  return (
    <>
      <main className="main-content" id="main-content">
        <NavBar />
        <HeroSection />
        <ArticleSection />
      </main>
      <Footer />
    </>
  );
}

export default App;
