import React from 'react';
import { Applicant, Stage } from '../../types';

interface StageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant;
  stages: Stage[];
  onSelectStage: (stage: Stage) => void;
}

export const StageSelectionModal: React.FC<StageSelectionModalProps> = ({
  isOpen,
  onClose,
  applicant,
  stages,
  onSelectStage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex justify-center items-end md:items-center z-50 p-0" onClick={onClose}>
      <div
        className="bg-[#1A1A1D] w-full md:max-w-sm rounded-t-2xl md:rounded-2xl shadow-2xl shadow-black/50 flex flex-col transform transition-all border border-zinc-700/50"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-4 border-b border-zinc-700">
          <h2 className="text-lg font-bold text-white text-center">
            Move <span className="text-accent-purple">{applicant.name}</span> to...
          </h2>
        </header>
        <main className="p-2 overflow-y-auto">
          <div className="grid grid-cols-1 gap-2">
            {stages.map(stage => (
              <button
                key={stage}
                onClick={() => onSelectStage(stage)}
                disabled={stage === applicant.stage}
                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  stage === applicant.stage
                    ? 'bg-accent-purple/20 text-accent-purple cursor-not-allowed'
                    : 'text-gray-300 hover:bg-zinc-800'
                }`}
              >
                {stage} {stage === applicant.stage && <span className="text-xs font-normal">(current)</span>}
              </button>
            ))}
          </div>
        </main>
        <footer className="px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-zinc-700 bg-black/20 flex justify-center">
            <button onClick={onClose} className="bg-zinc-700 hover:bg-zinc-600 text-gray-200 font-semibold py-2 px-6 rounded-lg transition-colors">
                Cancel
            </button>
        </footer>
      </div>
    </div>
  );
};