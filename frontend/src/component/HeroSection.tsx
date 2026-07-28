
import heroCatImg from '../assets/aii.png';

export default function HeroSection() {
  return (
    <section className="grid grid-cols-[1fr_1.25fr_1fr] gap-12 items-center mt-3 py-6 flex-grow max-[992px]:grid-cols-1 max-[992px]:gap-10 max-[992px]:py-4" id="hero-section">
      {/* Left Column: Heading and Subheading */}
     <div className="flex flex-col items-end text-right max-[992px]:items-center max-[992px]:text-center " id="hero-left">
        <h1 className="text-[56px] font-extrabold leading-[1.05] tracking-[-2px] text-custom-text-primary mb-5 max-[992px]:text-[44px] max-[576px]:text-[34px] drop-shadow-[0_0_20px_rgba(79,216,224,0.65)]" id="hero-title">
          AI<br />
          Hologram<br /> 
        </h1>
        <p className="text-[15px] text-custom-text-secondary leading-[1.55] max-w-[300px] font-normal max-[992px]:max-w-[70%] max-[550px]:max-w-[80%] max-[576px]:text-[13.5px]" id="hero-subtitle">
          Experience artificial intelligence in a tangible, three-dimensional format. 3D holograms illuminating mid-air and responding in real-time, bringing the future of human-AI interaction into your space without the limits of traditional screens.
        </p>
      </div>

      {/* Center Column: Portrait Image */}
      <div className="flex justify-center items-center" id="hero-center">
        <div className="w-full max-w-[360px] aspect-[3/4] overflow-hidden rounded-[24px] glass-panel animate-border-flash transition-transform duration-300 hover:scale-[1.02] max-[992px]:max-w-[300px]" id="hero-image-wrapper">
          <img
            src={heroCatImg}
            alt="Thompson P. with cat"
            className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity duration-300"
            id="hero-image"
          />
        </div>
      </div>

      {/* Right Column: Author Biography */}
    <div className="flex flex-col items-start text-left max-[992px]:items-center max-[992px]:text-center" id="hero-right">
        <span className="text-[11px] font-bold text-custom-text-muted uppercase tracking-[1px] mb-1.5" id="author-label">-Author</span>
        <h2 className="text-[26px] font-extrabold tracking-[-0.5px] text-custom-text-primary mb-4" id="author-name">Apisak Ngaotham</h2>
        <div className="flex flex-col gap-4 max-w-[300px] max-[992px]:max-w-[70%] max-[550px]:max-w-[80%]" id="author-bio">
          <p className="text-sm text-custom-text-secondary leading-[1.6] max-[576px]:text-[13.5px]" id="bio-paragraph-1">
            I am a Full-Stack Developer who loves transforming creative ideas into fully functional products. With expertise spanning from robust backend systems to meticulously crafted frontends, I am always exploring the frontiers of AI technology and its future directions.
          </p>
          <p className="text-sm text-custom-text-secondary leading-[1.6] max-[576px]:text-[13.5px]" id="bio-paragraph-2">
            My ultimate goal is to develop functional AI holograms, bringing intelligence to life in three-dimensional space. When I am not coding, I sketch new ideas and run experiments, constantly seeking ways to turn this futuristic vision into reality.
          </p>
        </div>
      </div>
    </section>
  );
}

