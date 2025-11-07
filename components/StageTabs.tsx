import React from 'react';
import { Applicant, Stage } from '../types';

interface StageTabsProps {
  stages: Stage[];
  applicants: Applicant[];
  activeStage: Stage;
  onStageSelect: (stage: Stage) => void;
}

export const StageTabs: React.FC<StageTabsProps> = ({ stages, applicants, activeStage, onStageSelect }) => {
  const applicantCounts = stages.reduce((acc, stage) => {
    acc[stage] = applicants.filter(app => app.stage === stage).length;
    return acc;
  }, {} as Record<Stage, number>);

  return (
    <div className="overflow-x-auto whitespace-nowrap">
      <nav className="flex space-x-2 p-2" aria-label="Tabs">
        {stages.map(stage => (
          <button
            key={stage}
            onClick={() => onStageSelect(stage)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeStage === stage
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            aria-current={activeStage === stage ? 'page' : undefined}
          >
            <span>{stage}</span>
            <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                activeStage === stage
                ? 'bg-white text-indigo-600'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {applicantCounts[stage] || 0}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};
