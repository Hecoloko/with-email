import React from 'react';
import { Applicant, Stage } from '../../types';

interface StageTabsProps {
  stages: (Stage | 'All')[];
  applicants: Applicant[];
  activeStage: Stage | 'All';
  onStageSelect: (stage: Stage | 'All') => void;
}

export const StageTabs: React.FC<StageTabsProps> = ({ stages, applicants, activeStage, onStageSelect }) => {
  const applicantCounts = stages.reduce((acc, stage) => {
    if (stage === 'All') {
      acc[stage] = applicants.length;
    } else {
      acc[stage] = applicants.filter(app => app.stage === stage).length;
    }
    return acc;
  }, {} as Record<Stage | 'All', number>);

  return (
    <div className="overflow-x-auto whitespace-nowrap no-scrollbar flex-shrink-0">
      <nav className="flex space-x-2 px-4 pb-4" aria-label="Tabs">
        {stages.map(stage => (
          <button
            key={stage}
            onClick={() => onStageSelect(stage)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeStage === stage
                ? 'bg-accent-purple text-white shadow shadow-purple-500/20'
                : 'text-gray-300 bg-zinc-800 hover:bg-zinc-700'
            }`}
            aria-current={activeStage === stage ? 'page' : undefined}
          >
            <span>{stage}</span>
            <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                activeStage === stage
                ? 'bg-white/20 text-white'
                : 'bg-zinc-700 text-zinc-200'
            }`}>
              {applicantCounts[stage] || 0}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};
