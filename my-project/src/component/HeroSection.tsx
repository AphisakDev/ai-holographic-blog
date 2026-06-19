
import heroCatImg from '../assets/ai.png';

export default function HeroSection() {
  return (
    <section className="grid grid-cols-[1fr_1.25fr_1fr] gap-12 items-center mt-3 py-6 flex-grow max-[992px]:grid-cols-1 max-[992px]:gap-10 max-[992px]:py-4" id="hero-section">
      {/* Left Column: Heading and Subheading */}
      <div className="flex flex-col items-end text-right max-[992px]:items-center max-[992px]:text-center" id="hero-left">
        <h1 className="text-[56px] font-extrabold leading-[1.05] tracking-[-2px] text-custom-text-primary mb-5 max-[992px]:text-[44px] max-[576px]:text-[34px]" id="hero-title">
          AI<br />
          Hologram<br />
          in action
        </h1>
        <p className="text-[15px] text-custom-text-secondary leading-[1.55] max-w-[300px] font-normal max-[992px]:max-w-[420px] max-[576px]:text-[13.5px]" id="hero-subtitle">
          Explore the boundaries of what's possible with cutting-edge AI technology. Real-time demonstrations, practical applications, and insights that will shape the future.
        </p>
      </div>

      {/* Center Column: Portrait Image */}
      <div className="flex justify-center items-center" id="hero-center">
        <div className="w-full max-w-[360px] aspect-[3/4] overflow-hidden rounded-[24px] border border-custom-border shadow-[0_20px_48px_rgba(28,26,23,0.06)] transition-transform duration-300 hover:-translate-y-1 max-[992px]:max-w-[300px]" id="hero-image-wrapper">
          <img
            src={heroCatImg}
            alt="Thompson P. with cat"
            className="w-full h-full object-cover"
            id="hero-image"
          />
        </div>
      </div>

      {/* Right Column: Author Biography */}
      <div className="flex flex-col items-start text-left max-[992px]:items-center max-[992px]:text-center" id="hero-right">
        <span className="text-[11px] font-bold text-custom-text-muted uppercase tracking-[1px] mb-1.5" id="author-label">-Author</span>
        <h2 className="text-[26px] font-extrabold tracking-[-0.5px] text-custom-text-primary mb-4" id="author-name">Thompson P.</h2>
        <div className="flex flex-col gap-4 max-w-[300px] max-[992px]:max-w-[420px]" id="author-bio">
          <p className="text-sm text-custom-text-secondary leading-[1.6] max-[576px]:text-[13.5px]" id="bio-paragraph-1">
            I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness.
          </p>
          <p className="text-sm text-custom-text-secondary leading-[1.6] max-[576px]:text-[13.5px]" id="bio-paragraph-2">
            When I'm not writing, I spends time volunteering at my local animal shelter, helping cats find loving homes.
          </p>
        </div>
      </div>
    </section>
  );
}

