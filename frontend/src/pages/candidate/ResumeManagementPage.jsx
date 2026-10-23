import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { resumeService } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  UploadCloud,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Cpu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ResumeManagementPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [expandedResumeId, setExpandedResumeId] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myResumesList'],
    queryFn: () => resumeService.getMyResumes(),
  });

  const resumes = data?.data || [];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
        setUploadMessage({ type: 'error', text: 'Only PDF and DOCX files are permitted' });
        return;
      }
      setSelectedFile(file);
      setUploadMessage(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await resumeService.uploadResume(formData);
      setUploadMessage({ type: 'success', text: 'Resume uploaded and processed successfully with Apache PDFBox!' });
      setSelectedFile(null);
      refetch();
    } catch (err) {
      setUploadMessage({ type: 'error', text: err.response?.data?.message || 'Resume upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumeService.deleteResume(id);
        refetch();
      } catch (err) {
        alert('Failed to delete resume');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Resume Management</h1>
        <p className="text-xs text-text-muted">
          Upload PDF or DOCX documents for automated text extraction, skill normalization, and job matching
        </p>
      </div>

      {uploadMessage && (
        <div
          className={`p-3 rounded-md text-xs flex items-center gap-2 border ${
            uploadMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {uploadMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{uploadMessage.text}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <form
        onSubmit={handleUploadSubmit}
        className="bg-surface p-6 rounded-xl border border-dashed border-border-strong hover:border-brand-400 transition-colors shadow-card flex flex-col items-center justify-center text-center space-y-4"
      >
        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text-primary">
            {selectedFile ? selectedFile.name : 'Choose a resume file or drag and drop'}
          </p>
          <p className="text-xs text-text-muted">Supports PDF and DOCX formats up to 10MB</p>
        </div>

        <input
          type="file"
          id="resume-file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex gap-2">
          <label htmlFor="resume-file">
            <Button variant="secondary" size="sm" type="button" onClick={() => document.getElementById('resume-file').click()}>
              Browse Files
            </Button>
          </label>
          {selectedFile && (
            <Button type="submit" size="sm" isLoading={isUploading}>
              Upload & Extract Text
            </Button>
          )}
        </div>
      </form>

      {/* Uploaded Resumes List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Active Resumes ({resumes.length})
        </h2>

        {resumes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No resumes on file"
            description="Upload your latest resume to automatically match against open opportunities."
          />
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => {
              const isExpanded = expandedResumeId === resume.id;
              return (
                <div
                  key={resume.id}
                  className="bg-surface rounded-xl border border-border shadow-card overflow-hidden transition-all"
                >
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-text-primary">{resume.fileName}</h3>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {resume.parsingStatus}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          {formatFileSize(resume.fileSize)} • Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/resumes/${resume.id}/download`}
                        download={resume.fileName}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-surface-subtle transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="p-1.5 text-text-muted hover:text-status-danger rounded-md hover:bg-rose-50 transition-colors"
                        title="Delete resume"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Parsed Skills Tag Strip */}
                  {resume.skills && resume.skills.length > 0 && (
                    <div className="px-5 pb-4 border-t border-border pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-brand-600" />
                          Parsed Skills & Competencies ({resume.skills.length})
                        </span>
                        <button
                          onClick={() => setExpandedResumeId(isExpanded ? null : resume.id)}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
                        >
                          {isExpanded ? 'Hide Extracted Text' : 'View Extracted Text'}
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {resume.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200"
                            title={s.contextSnippet}
                          >
                            {s.normalizedName}
                          </span>
                        ))}
                      </div>

                      {/* Extracted Text Viewer */}
                      {isExpanded && (
                        <div className="mt-4 p-4 rounded-lg bg-surface-subtle border border-border text-xs text-text-secondary max-h-72 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
                          {resume.rawText || 'No machine-readable text was extracted.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
