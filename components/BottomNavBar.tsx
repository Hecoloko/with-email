import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { UsersIcon } from './icons/UsersIcon';

type View = 'dashboard' | 'applicants';

interface BottomNavBarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200"
      aria-current={isActive ? 'page' : undefined}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className={`transition-colors ${isActive ? 'text-accent-purple' : 'text-zinc-400'}`}>
        {icon}
      </div>
      <span className={`text-xs font-medium transition-colors ${isActive ? 'text-white' : 'text-zinc-400'}`}>
        {label}
      </span>
    </button>
  );
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto h-[5.5rem] bg-zinc-900/80 backdrop-blur-lg rounded-t-3xl border-t border-zinc-700/50 z-20">
      <div className="flex justify-around items-start h-full pt-2 pb-[env(safe-area-inset-bottom)]">
        <NavItem
          label="Dashboard"
          icon={<HomeIcon className="h-6 w-6" />}
          isActive={activeView === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        />
        <NavItem
          label="Applicants"
          icon={<UsersIcon className="h-6 w-6" />}
          isActive={activeView === 'applicants'}
          onClick={() => onNavigate('applicants')}
        />
      </div>
    </nav>
  );
};