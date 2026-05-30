import Link from 'next/link';

interface ToolCardProps {
  slug: string;
  name: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
}

export default function ToolCard({ slug, name, description, icon, comingSoon }: ToolCardProps) {
  if (comingSoon) {
    return (
      <div className="card p-6 flex flex-col gap-4 opacity-75 cursor-not-allowed">
        <div className="flex justify-between items-start">
          <div className="text-3xl bg-[var(--color-bg-muted)] w-12 h-12 rounded-lg flex items-center justify-center grayscale">
            {icon}
          </div>
          <span className="badge-coming-soon">Coming Soon</span>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--color-text)] mb-1 text-lg">{name}</h3>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/tools/${slug}`} className="block h-full outline-none">
      <div className="card p-6 flex flex-col gap-4 h-full group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
        {/* Subtle hover gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none" />
        
        <div className="text-3xl bg-[#EEF4FF] group-hover:bg-[#E0EBFF] w-12 h-12 rounded-lg flex items-center justify-center transition-colors shadow-sm">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-[var(--color-text)] mb-1 text-lg group-hover:text-[var(--color-primary)] transition-colors">{name}</h3>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{description}</p>
        </div>
      </div>
    </Link>
  );
}
