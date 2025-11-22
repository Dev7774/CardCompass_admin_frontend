import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  linkTo?: string;
}

const Logo = ({
  className = '',
  showText = true,
  size = 'md',
  linkTo = '/',
}: LogoProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  };

  const logoContent = (
    <>
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <img
          src="/Logo.png"
          alt="CardCompass Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback if logo doesn't exist yet
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        {/* Fallback icon if logo not found */}
        <div
          className="hidden w-full h-full bg-primary-100 rounded-lg items-center justify-center"
          style={{ display: 'none' }}
        >
          <svg
            className="w-1/2 h-1/2 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
      </div>
      {showText && (
        <span
          className={`font-bold text-primary-600 ${textSizeClasses[size]} ${
            className.includes('flex-col') ? 'mt-2' : 'ml-2'
          }`}
        >
          CardCompass Admin
        </span>
      )}
    </>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className={`flex items-center ${className}`}>
        {logoContent}
      </Link>
    );
  }

  return <div className={`flex items-center ${className}`}>{logoContent}</div>;
};

export default Logo;

