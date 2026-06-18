
import heroCatImg from '../assets/hero_cat.png';

export default function HeroSection() {
  return (
    <section className="hero-section" id="hero-section">
      {/* Left Column: Heading and Subheading */}
      <div className="hero-left" id="hero-left">
        <h1 className="hero-title" id="hero-title">
          Stay<br />
          Informed,<br />
          Stay Inspired
        </h1>
        <p className="hero-subtitle" id="hero-subtitle">
          Discover a World of Knowledge at Your Fingertips. Your Daily Dose of Inspiration and Information.
        </p>
      </div>

      {/* Center Column: Portrait Image */}
      <div className="hero-center" id="hero-center">
        <div className="hero-image-wrapper" id="hero-image-wrapper">
          <img
            src={heroCatImg}
            alt="Thompson P. with cat"
            className="hero-image"
            id="hero-image"
          />
        </div>
      </div>

      {/* Right Column: Author Biography */}
      <div className="hero-right" id="hero-right">
        <span className="author-label" id="author-label">-Author</span>
        <h2 className="author-name" id="author-name">Thompson P.</h2>
        <div className="author-bio" id="author-bio">
          <p className="bio-paragraph" id="bio-paragraph-1">
            I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness.
          </p>
          <p className="bio-paragraph" id="bio-paragraph-2">
            When I'm not writing, I spends time volunteering at my local animal shelter, helping cats find loving homes.
          </p>
        </div>
      </div>
    </section>
  );
}
