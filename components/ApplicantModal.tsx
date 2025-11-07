import React, { useState, useEffect, useMemo } from 'react';
import { Applicant, TeamMember, Task, Note, Attachment, TaskStatus, Stage } from '../types';
import { 
    summarizeNotes, generateInterviewQuestions
} from './Gemini';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { Session } from '@supabase/supabase-js';


const PlusIconSmall: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

interface ApplicantModalProps {
  applicant: Applicant;
  session: Session;
  teamMembers: TeamMember[];
  onClose: () => void;
  onUpdate: (applicant: Applicant) => void;
  startInEditMode: boolean;
  uploadFile: (file: File, applicantId: string) => Promise<string>;
  onDelete: (applicantId: string) => void;
}

export const ApplicantModal: React.FC<ApplicantModalProps> = ({ applicant, session, teamMembers, onClose, onUpdate, startInEditMode, uploadFile, onDelete }) => {
  const [editedApplicant, setEditedApplicant] = useState<Applicant>(applicant);
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [activeTab, setActiveTab] = useState('Details');
  const [newAttachmentFile, setNewAttachmentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState('');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionFocus, setQuestionFocus] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [taskSortOrder, setTaskSortOrder] = useState<'newest' | 'oldest'>('newest');


  useEffect(() => {
    setEditedApplicant(applicant);
    setIsEditing(startInEditMode);
    setHasUnsavedChanges(false);
    setSummary('');
    setInterviewQuestions('');
    setQuestionFocus('');
  }, [applicant, startInEditMode]);

  const handleFieldChange = (field: keyof Applicant, value: any) => {
    setEditedApplicant(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };
  
  const handleNoteAdd = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: `note-${Date.now()}`,
        content: newNote.trim(),
        created_at: new Date().toISOString(),
        created_by: session.user.id,
      };
      handleFieldChange('notes', [...(editedApplicant.notes || []), note]);
      setNewNote('');
    }
  };

  const handleNoteDelete = (noteId: string) => {
    handleFieldChange('notes', editedApplicant.notes?.filter(n => n.id !== noteId));
  };
  
  const handleAllNotesDelete = () => {
    if (window.confirm('Are you sure you want to remove all notes?')) {
        handleFieldChange('notes', []);
    }
  };

  const handleTaskAdd = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: `task-${Date.now()}`,
        description: newTask.trim(),
        status: 'To Do',
        created_at: new Date().toISOString(),
        created_by: session.user.id,
      };
      handleFieldChange('tasks', [...(editedApplicant.tasks || []), task]);
      setNewTask('');
    }
  };

  const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
    const updatedTasks = editedApplicant.tasks?.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    handleFieldChange('tasks', updatedTasks);
  };

  const handleTaskDelete = (taskId: string) => {
    handleFieldChange('tasks', editedApplicant.tasks?.filter(t => t.id !== taskId));
  };
  
  const handleAllTasksDelete = () => {
    if (window.confirm('Are you sure you want to remove all tasks?')) {
        handleFieldChange('tasks', []);
    }
  };

  const handleAttachmentUpload = async () => {
    if (!newAttachmentFile) return;

    setIsUploading(true);
    try {
      const fileUrl = await uploadFile(newAttachmentFile, applicant.id);

      const attachment: Attachment = {
        id: `attachment-${Date.now()}`,
        file_name: newAttachmentFile.name,
        url: fileUrl,
        mime_type: newAttachmentFile.type,
        created_by: session.user.id,
        bucket: 'attachments',
        object_path: fileUrl.split('?')[0].split('/attachments/')[1],
      };

      handleFieldChange('attachments', [...(editedApplicant.attachments || []), attachment]);
      setNewAttachmentFile(null);
      const fileInput = document.getElementById('attachment-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error("Error uploading attachment:", error);
      const errorMessage = error?.message || JSON.stringify(error) || 'An unknown error occurred.';
      alert(`Failed to upload attachment.\n\nDetails: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAttachmentDelete = (attachmentId: string) => {
    handleFieldChange('attachments', editedApplicant.attachments?.filter(a => a.id !== attachmentId));
  };

  const handleAllAttachmentsDelete = () => {
    if (window.confirm('Are you sure you want to remove all attachments?')) {
        handleFieldChange('attachments', []);
    }
  };

  const handleSave = () => {
    onUpdate(editedApplicant);
    setHasUnsavedChanges(false);
    if (!startInEditMode) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedApplicant(applicant);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };
  
  const handleDelete = () => {
    onDelete(editedApplicant.id);
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary('');
    try {
      const result = await summarizeNotes(editedApplicant);
      setSummary(result);
    } catch (error: any) {
      setSummary(error.message);
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    setInterviewQuestions('');
    try {
      const result = await generateInterviewQuestions(editedApplicant, numQuestions, questionFocus);
      setInterviewQuestions(result);
    } catch (error: any) {
      setInterviewQuestions(error.message);
    } finally {
        setIsGeneratingQuestions(false);
    }
  };
  
  const displayedTasks = useMemo(() => {
    return (editedApplicant.tasks || [])
      .filter(task => {
        if (taskStatusFilter === 'All') return true;
        return task.status === taskStatusFilter;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return taskSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [editedApplicant.tasks, taskStatusFilter, taskSortOrder]);
  
  const TabButton = ({ name }: { name: string }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        activeTab === name
          ? 'bg-accent-purple text-white'
          : 'text-gray-300 hover:bg-zinc-700'
      }`}
    >
      {name}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex justify-center items-center z-50 p-0 md:p-4" onClick={onClose}>
      <div className="bg-[#1A1A1D] w-full h-full md:w-full md:max-w-3xl md:h-auto md:max-h-[90vh] md:rounded-2xl shadow-none md:shadow-2xl md:shadow-black/50 flex flex-col transform transition-all text-gray-300 border border-zinc-700/50" onClick={e => e.stopPropagation()}>
        <header className="flex-shrink-0 flex justify-between items-start px-6 pb-4 pt-[calc(1.5rem+env(safe-area-inset-top))] md:p-6 border-b border-zinc-700">
          <div className="max-w-[80%]">
            <h2 className="text-xl md:text-2xl font-bold text-white truncate">{applicant.name}</h2>
            <p className="text-gray-400 truncate">{applicant.role}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-gray-200 hover:text-white bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
          </div>
        </header>

        <main className="px-6 py-4 md:p-6 overflow-y-auto bg-zinc-900/30 no-scrollbar">
          <div className="border-b border-zinc-700 mb-4">
              <nav className="flex space-x-2" aria-label="Tabs">
                  <TabButton name="Details" />
                  <TabButton name="Tasks" />
                  <TabButton name="Notes" />
                  <TabButton name="Attachments" />
              </nav>
          </div>
          
          {activeTab === 'Details' && (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Email</label>
                    <input type="email" value={editedApplicant.email || ''} onChange={(e) => handleFieldChange('email', e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-600 rounded-lg py-2 px-3 text-white disabled:bg-zinc-800/50 disabled:cursor-not-allowed focus:border-accent-purple focus:ring-accent-purple" disabled={!isEditing}/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Phone</label>
                    <input type="tel" value={editedApplicant.phone || ''} onChange={(e) => handleFieldChange('phone', e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-600 rounded-lg py-2 px-3 text-white disabled:bg-zinc-800/50 disabled:cursor-not-allowed focus:border-accent-purple focus:ring-accent-purple" disabled={!isEditing}/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Assigned To</label>
                    <select value={editedApplicant.assigned_to_id || ''} onChange={e => handleFieldChange('assigned_to_id', e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-600 rounded-lg py-2 px-3 text-white disabled:bg-zinc-800/50 disabled:cursor-not-allowed focus:border-accent-purple focus:ring-accent-purple" disabled={!isEditing}>
                        <option value="">Unassigned</option>
                        {teamMembers.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Interview Date</label>
                    <input type="datetime-local" value={editedApplicant.interview_date ? editedApplicant.interview_date.slice(0, 16) : ''} onChange={e => handleFieldChange('interview_date', e.target.value)} className="mt-1 w-full bg-zinc-800 border border-zinc-600 rounded-lg py-2 px-3 text-white disabled:bg-zinc-800/50 disabled:cursor-not-allowed focus:border-accent-purple focus:ring-accent-purple" disabled={!isEditing}/>
                </div>

                <div className="pt-4">
                    <h3 className="text-lg font-semibold text-white mb-2">AI Summary</h3>
                    <button onClick={handleSummarize} disabled={isSummarizing} className="mb-2 bg-accent-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                        {isSummarizing ? 'Summarizing...' : 'Summarize Notes'}
                    </button>
                    {summary && (
                        <div className="p-3 bg-zinc-800 rounded-lg text-gray-300 text-sm whitespace-pre-wrap">
                            {summary}
                        </div>
                    )}
                </div>
                <hr className="border-zinc-700" />
                 <div className="pt-4">
                    <h3 className="text-lg font-semibold text-white mb-2">AI Interview Questions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="md:col-span-2">
                        <label htmlFor="question-focus" className="block text-sm font-medium text-gray-400 mb-1">Focus Areas</label>
                        <input
                          id="question-focus"
                          type="text"
                          value={questionFocus}
                          onChange={(e) => setQuestionFocus(e.target.value)}
                          placeholder="e.g., React hooks, leadership..."
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg py-2 px-3 text-white focus:border-accent-purple focus:ring-accent-purple"
                        />
                      </div>
                      <div>
                        <label htmlFor="num-questions" className="block text-sm font-medium text-gray-400 mb-1"># of Questions</label>
                        <input
                          id="num-questions"
                          type="number"
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(Number(e.target.value))}
                          min="1"
                          max="20"
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg py-2 px-3 text-white focus:border-accent-purple focus:ring-accent-purple"
                        />
                      </div>
                    </div>
                    <button onClick={handleGenerateQuestions} disabled={isGeneratingQuestions} className="mb-2 bg-accent-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                        {isGeneratingQuestions ? 'Generating...' : 'Generate Interview Questions'}
                    </button>
                    {(isGeneratingQuestions || interviewQuestions) && (
                        <div className="p-3 bg-zinc-800 rounded-lg text-gray-300 text-sm whitespace-pre-wrap">
                            {isGeneratingQuestions ? 'Generating, please wait...' : interviewQuestions}
                        </div>
                    )}
                </div>
            </div>
          )}

          {activeTab === 'Tasks' && (
             <div>
                <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">Tasks</h3>
                        {isEditing && editedApplicant.tasks && editedApplicant.tasks.length > 0 && (
                            <button 
                                onClick={handleAllTasksDelete}
                                className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-zinc-700 transition-colors"
                                title="Delete all tasks"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-lg">
                            {(['All', 'To Do', 'In Progress', 'Done'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setTaskStatusFilter(status)}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                        taskStatusFilter === status
                                        ? 'bg-accent-purple text-white shadow-sm'
                                        : 'text-gray-300 hover:bg-zinc-700'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <div>
                            <select
                                value={taskSortOrder}
                                onChange={(e) => setTaskSortOrder(e.target.value as 'newest' | 'oldest')}
                                className="bg-zinc-800 border border-zinc-600 rounded-lg py-1.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple"
                            >
                                <option value="newest">Sort: Newest First</option>
                                <option value="oldest">Sort: Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>
                {isEditing && (
                  <div className="flex gap-2 mb-4">
                      <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add a new task..." className="flex-grow bg-zinc-800 border border-zinc-600 rounded-lg py-2 px-3 text-white focus:border-accent-purple focus:ring-accent-purple" onKeyDown={e => e.key === 'Enter' && handleTaskAdd()} />
                      <button onClick={handleTaskAdd} className="bg-accent-purple text-white hover:bg-purple-700 p-2 rounded-lg"><PlusIconSmall /></button>
                  </div>
                )}
                <ul className="space-y-2">
                    {displayedTasks.map(task => (
                        <li key={task.id} className="flex items-center justify-between bg-zinc-800 p-2 rounded-lg border border-zinc-700">
                            <span className="flex-grow text-gray-300">{task.description}</span>
                            <div className="flex items-center gap-2">
                                <select value={task.status} onChange={(e) => handleTaskStatusChange(task.id, e.target.value as Task['status'])} disabled={!isEditing} className={`text-xs px-2 py-1 rounded-full border-none appearance-none text-white ${task.status === 'Done' ? 'bg-green-600' : task.status === 'In Progress' ? 'bg-yellow-600' : 'bg-gray-500'} ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                                {isEditing && <button onClick={() => handleTaskDelete(task.id)} className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-zinc-700 transition-colors"><TrashIcon className="h-4 w-4" /></button>}
                            </div>
                        </li>
                    ))}
                     {displayedTasks.length === 0 && (
                        <li className="text-center text-gray-500 py-4">
                            No tasks match the current filter.
                        </li>
                    )}
                </ul>
            </div>
          )}

          {activeTab === 'Notes' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-white">Notes</h3>
                  {isEditing && editedApplicant.notes && editedApplicant.notes.length > 0 && (
                      <button 
                          onClick={handleAllNotesDelete}
                          className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-zinc-700 transition-colors"
                          title="Delete all notes"
                      >
                          <TrashIcon className="h-5 w-5" />
                      </button>
                  )}
              </div>
              {isEditing && (
                <div className="flex gap-2 mb-4">
                  <textarea 
                    value={newNote} 
                    onChange={e => setNewNote(e.target.value)} 
                    placeholder="Add a new note..." 
                    rows={3}
                    className="flex-grow bg-zinc-800 border border-zinc-600 rounded-lg py-2 px-3 text-white focus:border-accent-purple focus:ring-accent-purple" 
                  />
                  <button onClick={handleNoteAdd} className="bg-accent-purple text-white hover:bg-purple-700 p-2 rounded-lg self-start"><PlusIconSmall /></button>
                </div>
              )}
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {editedApplicant.notes?.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(note => (
                  <li key={note.id} className="bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{note.content}</p>
                      {isEditing && (
                        <button onClick={() => handleNoteDelete(note.id)} className="text-gray-400 hover:text-red-400 ml-2 p-1 rounded-full hover:bg-zinc-700 transition-colors">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{new Date(note.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'Attachments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Attachments</h3>
                  {isEditing && editedApplicant.attachments && editedApplicant.attachments.length > 0 && (
                      <button 
                          onClick={handleAllAttachmentsDelete}
                          className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-zinc-700 transition-colors"
                          title="Delete all attachments"
                      >
                          <TrashIcon className="h-5 w-5" />
                      </button>
                  )}
              </div>
              <div className="flex items-center gap-2 mb-4 p-3 bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-600">
                <input
                  type="file"
                  id="attachment-upload"
                  onChange={(e) => setNewAttachmentFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-purple file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
                 <button 
                  onClick={handleAttachmentUpload} 
                  disabled={!newAttachmentFile || isUploading}
                  className="bg-accent-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              <ul className="space-y-2">
                {editedApplicant.attachments?.map(attachment => (
                  <li key={attachment.id} className="flex items-center justify-between bg-zinc-800 p-2 rounded-lg border border-zinc-700">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline truncate pr-2">
                      {attachment.file_name}
                    </a>
                    {isEditing && (
                      <button onClick={() => handleAttachmentDelete(attachment.id)} className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-zinc-700 transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
        
        <footer className="flex-shrink-0 px-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:p-6 border-t border-zinc-700 bg-black/20 mt-auto">
            {(isEditing || hasUnsavedChanges) ? (
                <div className="flex flex-col sm:flex-row-reverse sm:items-center gap-3">
                    <button onClick={handleSave} disabled={!hasUnsavedChanges} className="w-full sm:w-auto bg-accent-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">Save Changes</button>
                    <button onClick={handleCancelEdit} className="w-full sm:w-auto bg-zinc-700 hover:bg-zinc-600 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                    {isEditing && (
                        <button 
                            onClick={handleDelete}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors sm:mr-auto"
                        >
                            Delete Applicant
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex justify-end">
                    <button onClick={onClose} className="w-full sm:w-auto bg-zinc-700 hover:bg-zinc-600 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors">Close</button>
                </div>
            )}
        </footer>
      </div>
    </div>
  );
};