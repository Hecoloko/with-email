import React from 'react';
import { Applicant, Stage } from '../types';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end md:items-center z-50 p-0" onClick={onClose}>
      <div
        className="bg-white w-full md:max-w-sm rounded-t-lg md:rounded-lg shadow-xl flex flex-col transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 text-center">
            Move <span className="text-indigo-600">{applicant.name}</span> to...
          </h2>
        </header>
        <main className="p-2 overflow-y-auto">
          <div className="grid grid-cols-1 gap-2">
            {stages.map(stage => (
              <button
                key={stage}
                onClick={() => onSelectStage(stage)}
                disabled={stage === applicant.stage}
                className={`w-full text-left px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  stage === applicant.stage
                    ? 'bg-indigo-100 text-indigo-700 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {stage} {stage === applicant.stage && <span className="text-xs font-normal">(current)</span>}
              </button>
            ))}
          </div>
        </main>
        <footer className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center">
            <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors">
                Cancel
            </button>
        </footer>
      </div>
    </div>
  );
};
