import { Link } from 'react-router-dom';
import heroCatImg from '../assets/aii.png';
import { formatDate } from '../lib/utils';

interface BlogCardProps {
  id: number;
  image: string;
  category: string;
  title: string;
  description: string;
  author: string;
  date: string;
  likes: number;
  content: string;
  index?: number;
}

export default function BlogCard({
  id,
  image,
  category,
  title,
  description,
  author,
  date,
  index = 0,
}: BlogCardProps) {
  return (
    <div 
      style={{ animationDelay: `${index * 80}ms` }}
      className="glass-panel rounded-[24px] p-5 flex flex-col gap-4 shadow-[0_10px_30px_rgba(79,216,224,0.06)] hover:shadow-[0_15px_40px_rgba(79,216,224,0.18)] hover:scale-[1.015] transition-all duration-300 fade-in-card"
    >
      <Link to={`/post/${id}`} className="relative h-[200px] sm:h-[260px] overflow-hidden rounded-[18px] block">
        <img className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" src={image} alt={title} />
      </Link>
      <div className="flex flex-col flex-grow">
        <div className="flex mb-3">
          <span className="bg-[#4fd8e0]/15 text-[#4fd8e0] border border-[#4fd8e0]/30 rounded-full px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider">
            {category}
          </span>
        </div>
        <Link to={`/post/${id}`}>
          <h3 className="text-start font-extrabold text-lg text-custom-text-primary mb-2 line-clamp-2 hover:text-[#4fd8e0] transition-colors duration-200" style={{ textShadow: 'none' }}>
            {title}
          </h3>
        </Link>
        <p className="text-custom-text-secondary text-sm mb-4 flex-grow line-clamp-3 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center text-xs text-custom-text-muted mt-auto pt-3 border-t border-custom-border/50">
          <img className="w-6 h-6 rounded-full mr-2 object-cover border border-[#4fd8e0]/30" src={heroCatImg} alt={author} />
          <span className="font-semibold text-custom-text-secondary">{author}</span>
          <span className="mx-2 text-custom-text-muted">|</span>
          <span>{formatDate(date)}</span>
        </div>
      </div>
    </div>
  );
}


