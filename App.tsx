import React, { useState, useEffect } from 'react';
import { ApplicantModal } from './components/ApplicantModal';
import { AddApplicantForm } from './components/AddApplicantForm';
import { STAGES, TEAM_MEMBERS, DEFAULT_AVATAR_URL } from './constants';
import type { Applicant, Stage } from './types';
import { supabase } from './supabaseClient';
import { Auth } from './components/Auth';
import { Session } from '@supabase/supabase-js';
import { MobileKanbanBoard } from './components/mobile/MobileKanbanBoard';
import { StageSelectionModal } from './components/mobile/StageSelectionModal';
import { FloatingActionButton } from './components/FloatingActionButton';
import { BottomNavBar } from './components/BottomNavBar';
import { Dashboard } from './components/Dashboard';
import { ApplicantsHeader } from './components/mobile/ApplicantsHeader';
import { useMediaQuery } from './components/useMediaQuery';
import { KanbanBoard } from './components/KanbanBoard';
import { PlusIcon } from './components/icons/PlusIcon';
import { FilterModal } from './components/mobile/FilterModal';
import { EmailComposerModal } from './components/EmailComposerModal';

type View = 'dashboard' | 'applicants';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicantInfo, setSelectedApplicantInfo] = useState<{ applicant: Applicant; startInEditMode: boolean } | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applicantForEmail, setApplicantForEmail] = useState<Applicant | null>(null);
  
  // Mobile-specific state
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [activeStage, setActiveStage] = useState<Stage | 'All'>('All');
  const [movingApplicant, setMovingApplicant] = useState<Applicant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);

  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    };
    
    const fetchApplicants = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('applicants')
        .select('*, notes(*), tasks(*), attachments(*)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching applicants:', error.message || JSON.stringify(error));
      } else {
        setApplicants(data as Applicant[]);
      }
      setLoading(false);
    };
    fetchApplicants();
  }, [session]);

  const handleStageChange = async (applicantId: string, stage: Stage) => {
    if (!session) return;

    const applicant = applicants.find(a => a.id === applicantId);
    if (!applicant || applicant.stage === stage) return;

    const originalApplicants = applicants;
    setApplicants(prevApplicants =>
      prevApplicants.map(app =>
        app.id === applicantId ? { ...app, stage } : app
      )
    );

    if (movingApplicant) setMovingApplicant(null);

    try {
      const { error: updateError } = await supabase
          .from('applicants')
          .update({ stage: stage })
          .eq('id', applicantId);
      if (updateError) throw updateError;
      
      const refreshedApplicantResponse = await supabase
        .from('applicants')
        .select('*, notes(*), tasks(*), attachments(*)')
        .eq('id', applicantId)
        .single();
      
      if (refreshedApplicantResponse.error) throw refreshedApplicantResponse.error;

      const refreshedApplicant = refreshedApplicantResponse.data as Applicant;
      setApplicants(prev => prev.map(app => (app.id === applicantId ? refreshedApplicant : app)));
      
    } catch (error) {
        console.error("Failed to update stage", error);
        alert("Failed to move applicant. Please try again.");
        setApplicants(originalApplicants);
    }
  };
  
  const handleUpdateApplicant = async (updatedApplicant: Applicant) => {
    if (!session) return;
    const originalApplicants = [...applicants];
    
    try {
        const { notes, tasks, attachments, id, ...rest } = updatedApplicant;
        const applicantId = id;

        const allowedApplicantColumns = [
            'name', 'role', 'avatar_url', 'stage', 'assigned_to_id', 'interview_date', 'email', 'phone'
        ] as const;

        const filtered: Record<string, any> = {};
        for (const k of allowedApplicantColumns) {
            if (k in rest && (rest as any)[k] !== undefined) {
                filtered[k] = (rest as any)[k];
            }
        }
        if (filtered.assigned_to_id === '') filtered.assigned_to_id = null;
        if (filtered.interview_date === '') filtered.interview_date = null;
        
        const { error: applicantError } = await supabase
            .from('applicants')
            .update(filtered)
            .eq('id', applicantId);
        if (applicantError) throw applicantError;

        const syncRelatedRecords = async (tableName: string, originalItems: any[] | undefined, currentItems: any[] | undefined) => {
            const original = originalItems || [];
            const current = currentItems || [];
            
            const idsToDelete = original
              .filter(item => !current.find(curr => curr.id === item.id))
              .map(item => item.id);

            if (idsToDelete.length > 0) {
                const { error } = await supabase.from(tableName).delete().in('id', idsToDelete);
                if (error) throw error;
            }

            if (current.length > 0) {
                const itemsToUpsert = current.map(item => {
                    const isTempId = typeof item.id === 'string' && (item.id.startsWith('note-') || item.id.startsWith('task-') || item.id.startsWith('attachment-'));
                    const { id, ...restOfItem } = item;
                    return {
                        ...(isTempId ? {} : { id }),
                        ...restOfItem,
                        applicant_id: applicantId,
                    };
                });
                const { error } = await supabase.from(tableName).upsert(itemsToUpsert);
                if (error) throw error;
            }
        };
        
        const originalApplicant = originalApplicants.find(a => a.id === applicantId);
        if (!originalApplicant) throw new Error("Could not find original applicant record to sync changes.");

        await syncRelatedRecords('notes', originalApplicant.notes, notes);
        await syncRelatedRecords('tasks', originalApplicant.tasks, tasks);
        await syncRelatedRecords('attachments', originalApplicant.attachments, attachments);
        
        if (originalApplicant.stage !== updatedApplicant.stage) {
            await handleStageChange(applicantId, updatedApplicant.stage);
        }

        const { data: refreshedApplicant, error: fetchError } = await supabase
            .from('applicants')
            .select('*, notes(*), tasks(*), attachments(*)')
            .eq('id', applicantId)
            .single();

        if (fetchError) throw fetchError;
        
        setApplicants(prev => prev.map(app => (app.id === applicantId ? (refreshedApplicant as Applicant) : app)));
        
        setSelectedApplicantInfo(null);

    } catch (error: any) {
        console.error('Error updating applicant:', error);
        alert(`Failed to update applicant.\n\nDetails: ${error.message || error}`);
        setApplicants(originalApplicants);
    }
  };

  const uploadFile = async (file: File, applicantId: string): Promise<string> => {
    if (!session) throw new Error("User not authenticated for file upload.");
    const filePath = `${session.user.id}/${applicantId}/${Date.now()}-${file.name}`;
  
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);
    if (uploadError) throw uploadError;
  
    const { data: signed, error: signErr } = await supabase.storage
      .from('attachments')
      .createSignedUrl(filePath, 60 * 60);
    if (signErr || !signed?.signedUrl) throw signErr || new Error("No signed URL");
  
    return signed.signedUrl;
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!session) throw new Error("User not authenticated for avatar upload.");
    const filePath = `${session.user.id}/avatars/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("Could not get public URL for avatar.");
    }
    
    return data.publicUrl;
  };

  const handleAddNewApplicant = async (newApplicantData: {
    name: string; role: string; notes: string; email: string; phone: string; attachment: File | null; avatarFile: File | null;
  }) => {
     if (!session) return;

     let avatarUrl = DEFAULT_AVATAR_URL;
     if (newApplicantData.avatarFile) {
        try {
            avatarUrl = await uploadAvatar(newApplicantData.avatarFile);
        } catch (error) {
            console.error("Failed to upload avatar:", error);
            alert("Could not upload the avatar image, using the default icon instead.");
        }
     }

     try {
      const newApplicantForDb = {
        name: newApplicantData.name,
        role: newApplicantData.role,
        email: newApplicantData.email || null,
        phone: newApplicantData.phone || null,
        stage: 'Applied' as Stage,
        avatar_url: avatarUrl,
      };

      const { data: insertedApplicant, error: insertError } = await supabase
        .from('applicants')
        .insert(newApplicantForDb)
        .select('*, notes(*), tasks(*), attachments(*)')
        .single();

      if (insertError) throw insertError;
      
      const applicant = insertedApplicant as Applicant;

      if (newApplicantData.notes.trim()) {
        const { data: insertedNote, error: noteError } = await supabase.from('notes').insert({
          content: newApplicantData.notes.trim(),
          applicant_id: applicant.id,
        }).select().single();
        if (noteError) throw noteError;
        if (insertedNote) applicant.notes = [insertedNote];
      }
      
      if (newApplicantData.attachment) {
          const fileUrl = await uploadFile(newApplicantData.attachment, applicant.id);
          const objectPath = fileUrl.split('?')[0].split('/attachments/')[1];
          const attachmentPayload: any = {
            file_name: newApplicantData.attachment.name, url: fileUrl, mime_type: newApplicantData.attachment.type,
            applicant_id: applicant.id, bucket: 'attachments', object_path: objectPath,
          };
          const { data: insertedAttachment, error: attachmentError } =
            await supabase.from('attachments').insert(attachmentPayload).select().single();
          if (attachmentError) throw attachmentError;
          if (insertedAttachment) applicant.attachments = [insertedAttachment];
      }
      
      setApplicants(prev => [applicant, ...prev]);
      setAddModalOpen(false);
    } catch (error: any) {
        console.error('Error adding applicant:', error);
        alert(`Failed to add new applicant.\n\nDetails: ${error.message}`);
    }
  };

  const handleDeleteApplicant = async (applicantId: string) => {
    if (!session || !window.confirm("Delete this applicant and all associated data? This cannot be undone.")) return;
    
    const originalApplicants = [...applicants];
    const applicantToDelete = originalApplicants.find(a => a.id === applicantId);
    if (!applicantToDelete) return;
  
    setApplicants(prev => prev.filter(app => app.id !== applicantId));
    if (selectedApplicantInfo?.applicant.id === applicantId) setSelectedApplicantInfo(null);
  
    try {
      const filePaths = (applicantToDelete.attachments || [])
        .map((att: any) => att.object_path).filter(Boolean);

      if (filePaths.length > 0) {
        await supabase.storage.from('attachments').remove(filePaths);
      }
  
      const { error: applicantError } = await supabase.from('applicants').delete().eq('id', applicantId);
      if (applicantError) throw applicantError;
  
    } catch (error: any) {
      console.error('Error deleting applicant:', error);
      alert(`Failed to delete applicant.\n\nDetails: ${error.message || error}`);
      setApplicants(originalApplicants);
    }
  };
  
  const openApplicantModal = (applicant: Applicant, startInEditMode: boolean = false) => {
    setSelectedApplicantInfo({ applicant, startInEditMode });
  };

  const closeApplicantModal = () => setSelectedApplicantInfo(null);

  // --- DESKTOP DRAG & DROP ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, applicantId: string) => {
    e.dataTransfer.setData("applicantId", applicantId);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, stage: Stage) => {
    e.preventDefault();
    const applicantId = e.dataTransfer.getData("applicantId");
    await handleStageChange(applicantId, stage);
  };
  

  if (!session) return <Auth />;
  
  const searchedAndFilteredApplicants = applicants.filter(app => {
    const stageMatch = activeStage === 'All' || app.stage === activeStage;
    if (!stageMatch) return false;

    const query = searchQuery.toLowerCase();
    const nameMatch = app.name.toLowerCase().includes(query);
    const roleMatch = app.role.toLowerCase().includes(query);

    return nameMatch || roleMatch;
  });

  // --- RENDER FUNCTIONS ---
  const renderMobileView = () => (
    <div className="w-full max-w-[430px] mx-auto h-full min-h-dvh flex flex-col relative bg-[#0F0F10] text-gray-300 font-sans">
      <header className="flex-shrink-0 flex justify-between items-center mb-6 p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <h1 className="text-3xl font-bold text-white capitalize">{activeView}</h1>
        <div className="flex items-center gap-4">
            <button onClick={() => supabase.auth.signOut()}
              className="bg-zinc-800 hover:bg-zinc-700 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Log Out
            </button>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col overflow-y-auto no-scrollbar pb-28">
        {activeView === 'dashboard' ? (
          <Dashboard applicants={applicants} onNavigateToStage={(stage) => { setActiveView('applicants'); setActiveStage(stage); }} />
        ) : (
          <>
            <ApplicantsHeader 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery}
              onFilterClick={() => setFilterModalOpen(true)}
            />
            <MobileKanbanBoard 
              loading={loading} 
              applicants={searchedAndFilteredApplicants} 
              teamMembers={TEAM_MEMBERS} 
              onCardClick={(app) => openApplicantModal(app, false)}
              onEditClick={(app) => openApplicantModal(app, true)}
              onDeleteClick={handleDeleteApplicant}
              onMoveClick={setMovingApplicant}
              onSendEmailClick={setApplicantForEmail}
            />
          </>
        )}
      </main>
      
      <FloatingActionButton onAddApplicant={() => setAddModalOpen(true)} />
      <BottomNavBar activeView={activeView} onNavigate={setActiveView} />
    </div>
  );

  const renderDesktopView = () => (
    <div className="h-screen bg-[#0F0F10] text-gray-300 font-sans p-4 sm:p-6 lg:p-8 flex flex-col">
      <header className="flex-shrink-0 flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Applicant Tracking</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-accent-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
          >
            <PlusIcon />
            Add Applicant
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-zinc-800 hover:bg-zinc-700 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>
      <main className="flex-grow overflow-hidden">
        <KanbanBoard
          applicants={applicants} stages={STAGES} teamMembers={TEAM_MEMBERS}
          onDragStart={handleDragStart} onDrop={handleDrop}
          onCardClick={(app) => openApplicantModal(app, false)}
          onEditClick={(app) => openApplicantModal(app, true)}
          onDeleteClick={handleDeleteApplicant}
          onSendEmailClick={setApplicantForEmail}
        />
      </main>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-[#0F0F10]">
        <p className="text-gray-400 text-2xl">Loading...</p>
      </div>
    );
  }

  const applicantCounts = (['All', ...STAGES] as (Stage | 'All')[]).reduce((acc, stage) => {
      if (stage === 'All') {
        acc[stage] = applicants.length;
      } else {
        acc[stage] = applicants.filter(app => app.stage === stage).length;
      }
      return acc;
    }, {} as Record<Stage | 'All', number>);

  return (
    <>
      {isDesktop ? renderDesktopView() : renderMobileView()}
      
      {/* Shared Modals */}
      {selectedApplicantInfo && session && (
        <ApplicantModal
          applicant={selectedApplicantInfo.applicant} session={session} startInEditMode={selectedApplicantInfo.startInEditMode}
          teamMembers={TEAM_MEMBERS} onClose={closeApplicantModal} onUpdate={handleUpdateApplicant}
          uploadFile={uploadFile} onDelete={handleDeleteApplicant}
        />
      )}

      {isAddModalOpen && (
        <AddApplicantForm onAdd={handleAddNewApplicant} onClose={() => setAddModalOpen(false)} />
      )}

      {movingApplicant && (
        <StageSelectionModal 
          isOpen={!!movingApplicant} applicant={movingApplicant} stages={STAGES}
          onClose={() => setMovingApplicant(null)}
          onSelectStage={(newStage) => handleStageChange(movingApplicant.id, newStage)}
        />
      )}

      {isFilterModalOpen && (
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          stages={['All', ...STAGES]}
          activeStage={activeStage}
          onSelectStage={(stage) => {
            setActiveStage(stage);
            setFilterModalOpen(false);
          }}
          applicantCounts={applicantCounts}
        />
      )}

      {applicantForEmail && (
        <EmailComposerModal 
          applicant={applicantForEmail}
          onClose={() => setApplicantForEmail(null)}
        />
      )}
    </>
  );
};

export default App;