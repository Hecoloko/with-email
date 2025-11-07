import React, { useState } from 'react';
import { parseResume } from './Gemini';
import { CameraCapture } from './CameraCapture';
import { CameraIcon } from './icons/CameraIcon';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon';
import { DEFAULT_AVATAR_URL } from '../constants';

interface AddApplicantFormProps {
  onAdd: (newApplicantData: { 
    name: string; 
    role: string; 
    notes: string;
    email: string;
    phone: string;
    attachment: File | null;
    avatarFile: File | null;
  }) => void;
  onClose: () => void;
}

export const AddApplicantForm: React.FC<AddApplicantFormProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isCameraOpen, setCameraOpen] = useState(false);

  const processResumeFile = async (file: File) => {
    setAttachment(file);
    setIsParsing(true);
    setParsingError(null);
    try {
      const parsedData = await parseResume(file);
      setName(parsedData.name || '');
      setRole(parsedData.role || '');
      setEmail(parsedData.email || '');
      setPhone(parsedData.phone || '');
      setNotes(parsedData.summary || '');
    } catch (error: any) {
      console.error("Resume parsing failed:", error);
      setParsingError("Could not automatically parse the resume. Please fill out the form manually.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processResumeFile(file);
    } else {
      setAttachment(null);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleFileFromCapture = (file: File) => {
    setCameraOpen(false);
    if(file) {
      processResumeFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      alert('Please fill in both name and role.');
      return;
    }
    onAdd({ name, role, notes, email, phone, attachment, avatarFile });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-lg flex justify-center items-center z-50 p-0 md:p-4"
        onClick={onClose}
      >
        <div
          className="relative bg-[#1A1A1D] w-full h-full md:w-full md:max-w-md md:h-auto md:max-h-[90vh] md:rounded-2xl shadow-none md:shadow-2xl md:shadow-black/50 px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:p-8 transform transition-all flex flex-col border border-zinc-700/50"
          onClick={e => e.stopPropagation()}
        >
          {isParsing && (
            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex flex-col justify-center items-center z-10 rounded-2xl">
              <svg className="animate-spin h-8 w-8 text-accent-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-white">Parsing Resume...</p>
            </div>
          )}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-white">Add New Applicant</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
          </div>

          <div className="flex-grow overflow-y-auto -mr-4 pr-4 no-scrollbar">
            <form onSubmit={handleSubmit} id="add-applicant-form" className="space-y-4">
              <div className="flex flex-col items-center gap-3 mb-4">
                  <img 
                      src={avatarPreviewUrl || DEFAULT_AVATAR_URL} 
                      alt="Avatar Preview"
                      className="w-24 h-24 rounded-full object-cover bg-zinc-700 border-2 border-zinc-600"
                  />
                  <label htmlFor="avatar-upload" className="text-sm font-medium text-accent-purple hover:text-purple-400 cursor-pointer p-2">
                      {avatarFile ? "Change Photo" : "Upload Photo"}
                  </label>
                  <input 
                      type="file" 
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Resume/CV (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">Upload a file or take a photo to automatically fill in details.</p>
                <div className="grid grid-cols-2 gap-3">
                  <label htmlFor="attachment" className="w-full flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer">
                    <DocumentArrowUpIcon className="h-5 w-5" />
                    Upload File
                  </label>
                  <input type="file" id="attachment" name="attachment" onChange={handleAttachmentChange} accept=".pdf,.doc,.docx,.txt,image/*" className="hidden"/>
                  
                  <button type="button" onClick={() => setCameraOpen(true)} className="w-full flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                     <CameraIcon className="h-5 w-5" />
                     Take Photo
                  </button>
                </div>
                {attachment && <p className="mt-2 text-sm text-gray-400">Attached: <span className="font-medium text-accent-purple">{attachment.name}</span></p>}
                {parsingError && <p className="mt-2 text-sm text-red-400">{parsingError}</p>}
              </div>

              <hr className="border-zinc-700" />

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-accent-purple focus:border-accent-purple sm:text-sm"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1">
                  Applying for Role <span className="text-red-400">*</span>
                </label>
                <input
                  type="text" id="role" name="role" value={role} onChange={(e) => setRole(e.target.value)} required
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-accent-purple focus:border-accent-purple sm:text-sm"
                  placeholder="e.g. Senior Product Manager"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-accent-purple focus:border-accent-purple sm:text-sm"
                  placeholder="e.g. jane.doe@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">
                  Phone
                </label>
                <input
                  type="tel" id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-accent-purple focus:border-accent-purple sm:text-sm"
                  placeholder="e.g. (555) 123-4567"
                />
              </div>
              <div>
                <label htmlFor="add-notes" className="block text-sm font-medium text-gray-400 mb-1">
                  Notes
                </label>
                <textarea
                  id="add-notes" name="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Initial notes about the applicant..."
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-accent-purple focus:border-accent-purple sm:text-sm"
                ></textarea>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-700 flex-shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              onClick={onClose}
              type="button"
              className="bg-zinc-700 hover:bg-zinc-600 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-applicant-form"
              className="bg-accent-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto"
            >
              Add Applicant
            </button>
          </div>
        </div>
      </div>
      {isCameraOpen && (
        <CameraCapture
          onCapture={handleFileFromCapture}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </>
  );
};