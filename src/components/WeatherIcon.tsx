import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Activity,
  Shirt,
  Navigation,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'Sun':
      return <Sun className={className} />;
    case 'Moon':
      return <Moon className={className} />;
    case 'CloudSun':
      return <CloudSun className={className} />;
    case 'CloudMoon':
      return <CloudMoon className={className} />;
    case 'Cloud':
      return <Cloud className={className} />;
    case 'CloudFog':
      return <CloudFog className={className} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={className} />;
    case 'CloudRain':
      return <CloudRain className={className} />;
    case 'CloudSnow':
      return <CloudSnow className={className} />;
    case 'CloudLightning':
      return <CloudLightning className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Shirt':
      return <Shirt className={className} />;
    case 'Navigation':
      return <Navigation className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
