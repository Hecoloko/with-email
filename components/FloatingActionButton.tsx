import React, { useState } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { CloseIcon } from './icons/CloseIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';

interface FloatingActionButtonProps {
    onAddApplicant: () => void;
}

const FabMenuItem: React.FC<{
    label: string;
    onClick: () => void;
    icon: React.ReactNode;
    show: boolean;
    delay: string;
}> = ({ label, onClick, icon, show, delay }) => (
    <div className="flex items-center justify-end gap-4">
        <span
            className={`text-white text-sm font-medium transition-all duration-200 ${show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
            style={{ transitionDelay: show ? delay : '0ms' }}
        >
            {label}
        </span>
        <button
            onClick={onClick}
            className={`w-12 h-12 rounded-[18px] bg-white/10 backdrop-blur-lg flex items-center justify-center text-white transition-all duration-200 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
            style={{ transitionDelay: show ? delay : '0ms' }}
            aria-label={label}
        >
            {icon}
        </button>
    </div>
);

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onAddApplicant }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const handleAddClick = () => {
        onAddApplicant();
        setIsOpen(false);
    }
    
    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-30" 
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-6 z-40 flex flex-col items-end gap-4">
                <div className="flex flex-col gap-4">
                     <FabMenuItem 
                        label="Support" 
                        onClick={() => alert('Support chat coming soon!')} 
                        icon={<ChatBubbleIcon className="h-6 w-6" />}
                        show={isOpen}
                        delay="200ms"
                    />
                     <FabMenuItem 
                        label="Add new applicant" 
                        onClick={handleAddClick} 
                        icon={<UserPlusIcon className="h-6 w-6" />}
                        show={isOpen}
                        delay="160ms"
                    />
                </div>
                
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-16 h-16 rounded-full bg-accent-purple text-white flex items-center justify-center shadow-lg shadow-purple-900/40 transform transition-all duration-300 hover:scale-110"
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                >
                    <div className={`transition-transform duration-300 ease-in-out absolute ${isOpen ? 'rotate-45 opacity-0' : 'rotate-0 opacity-100'}`}>
                         <PlusIcon className="h-8 w-8" />
                    </div>
                     <div className={`transition-transform duration-300 ease-in-out absolute ${isOpen ? 'rotate-0 opacity-100' : '-rotate-45 opacity-0'}`}>
                         <CloseIcon className="h-8 w-8" />
                    </div>
                </button>
            </div>
        </>
    );
};