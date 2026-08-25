import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  User, Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase,
  GraduationCap, Code, FolderOpen, Award, Star, Languages, FileText,
  BarChart3, Settings, Edit3, Plus, Trash2, X, Check, AlertCircle,
  Upload, Download, Eye, TrendingUp, Target, ChevronDown, ChevronUp,
  Building, Calendar, ExternalLink, Save, ArrowLeft, Zap, RefreshCw
} from "lucide-react";
import {
  profileApi, educationApi, experienceApi, skillsApi,
  projectsApi, certificationsApi, achievementsApi, languagesApi, resumeApi
} from "../../services/profileApi";

interface ProfileData {
  id: number;
  user: { id: number; firstName: string; lastName: string; email: string; role: string; profileImage?: string };
  phone?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  website?: string;
  preferredLocations?: string[];
  candidateType?: string;
  careerLevel?: string;
  professionalHeadline?: string;
  professionalSummary?: string;
  targetJobTitles?: string[];
  preferredIndustry?: string;
  expectedSalary?: number;
  currentSalary?: number;
  noticePeriod?: string;
  availableFrom?: string;
  willingToRelocate?: boolean;
  workModePreference?: string[];
  employmentTypePref?: string[];
  openToWork?: boolean;
  resumeUrl?: string;
  resumeName?: string;
  atsScore?: number;
  profileCompletion?: number;
  atsScoreBreakdown?: any;
  education: any[];
  experience: any[];
  skills: any[];
  projects: any[];
  certifications: any[];
  achievements: any[];
  languages: any[];
  resume?: any;
}

const defaultProfile: ProfileData = {
  id: 0,
  user: { id: 0, firstName: "", lastName: "", email: "", role: "" },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
};

export default function Profile() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [atsData, setAtsData] = useState<any>(null);
  const [completionData, setCompletionData] = useState<any>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [personalForm, setPersonalForm] = useState<any>({});
  const [careerForm, setCareerForm] = useState<any>({});
  const [preferencesForm, setPreferencesForm] = useState<any>({});
  const [newEducation, setNewEducation] = useState<any>(null);
  const [newExperience, setNewExperience] = useState<any>(null);
  const [newSkill, setNewSkill] = useState<any>(null);
  const [newProject, setNewProject] = useState<any>(null);
  const [newCertification, setNewCertification] = useState<any>(null);
  const [newAchievement, setNewAchievement] = useState<any>(null);
  const [newLanguage, setNewLanguage] = useState<any>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await profileApi.get();
      if (res.success && res.data) {
        setProfile(res.data);
        setPersonalForm({
          phone: res.data.phone || '',
          location: res.data.location || '',
          city: res.data.city || '',
          state: res.data.state || '',
          country: res.data.country || '',
          linkedinUrl: res.data.linkedinUrl || '',
          githubUrl: res.data.githubUrl || '',
          portfolioUrl: res.data.portfolioUrl || '',
          website: res.data.website || '',
        });
        setCareerForm({
          candidateType: res.data.candidateType || 'STUDENT_FRESHER',
          careerLevel: res.data.careerLevel || '',
          professionalHeadline: res.data.professionalHeadline || '',
          professionalSummary: res.data.professionalSummary || '',
          targetJobTitles: res.data.targetJobTitles || [],
          preferredIndustry: res.data.preferredIndustry || '',
        });
        setPreferencesForm({
          expectedSalary: res.data.expectedSalary || '',
          currentSalary: res.data.currentSalary || '',
          noticePeriod: res.data.noticePeriod || '',
          willingToRelocate: res.data.willingToRelocate || false,
          workModePreference: res.data.workModePreference || [],
          employmentTypePref: res.data.employmentTypePref || [],
        });
      }
    } catch (err) {
      showNotification('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }

    // Fetch ATS and completion data separately (non-blocking)
    try {
      const atsRes = await profileApi.getATSScore();
      if (atsRes.success && atsRes.data) setAtsData(atsRes.data);
    } catch { /* ATS data unavailable */ }

    try {
      const compRes = await profileApi.getCompletion();
      if (compRes.success && compRes.data) setCompletionData(compRes.data);
    } catch { /* Completion data unavailable */ }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const savePersonalInfo = async () => {
    setSaving(true);
    try {
      const res = await profileApi.update(personalForm);
      if (res.success) {
        showNotification('success', 'Personal information saved');
        setEditingSection(null);
        fetchProfile();
      } else {
        showNotification('error', res.message || 'Failed to save');
      }
    } catch { showNotification('error', 'Failed to save'); }
    setSaving(false);
  };

  const saveCareerInfo = async () => {
    setSaving(true);
    try {
      const res = await profileApi.update(careerForm);
      if (res.success) {
        showNotification('success', 'Career information saved');
        setEditingSection(null);
        fetchProfile();
      } else {
        showNotification('error', res.message || 'Failed to save');
      }
    } catch { showNotification('error', 'Failed to save'); }
    setSaving(false);
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const res = await profileApi.update(preferencesForm);
      if (res.success) {
        showNotification('success', 'Job preferences saved');
        setEditingSection(null);
        fetchProfile();
      } else {
        showNotification('error', res.message || 'Failed to save');
      }
    } catch { showNotification('error', 'Failed to save'); }
    setSaving(false);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const res = await resumeApi.upload(file);
      if (res.success) {
        showNotification('success', 'Resume uploaded and parsed successfully');
        fetchProfile();
      } else {
        showNotification('error', res.message || 'Upload failed');
      }
    } catch { showNotification('error', 'Upload failed'); }
    setUploadingResume(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addSectionItem = async (section: string, data: any) => {
    setSaving(true);
    try {
      let res;
      switch (section) {
        case 'education': res = await educationApi.upsert(data); break;
        case 'experience': res = await experienceApi.upsert(data); break;
        case 'skills': res = await skillsApi.upsert(data); break;
        case 'projects': res = await projectsApi.upsert(data); break;
        case 'certifications': res = await certificationsApi.upsert(data); break;
        case 'achievements': res = await achievementsApi.upsert(data); break;
        case 'languages': res = await languagesApi.upsert(data); break;
        default: return;
      }
      if (res?.success) {
        showNotification('success', `${section.charAt(0).toUpperCase() + section.slice(1)} saved`);
        resetNewItems();
        fetchProfile();
      } else {
        showNotification('error', res?.message || 'Failed to save');
      }
    } catch { showNotification('error', 'Failed to save'); }
    setSaving(false);
  };

  const deleteSectionItem = async (section: string, id: number) => {
    try {
      let res;
      switch (section) {
        case 'education': res = await educationApi.delete(id); break;
        case 'experience': res = await experienceApi.delete(id); break;
        case 'skills': res = await skillsApi.delete(id); break;
        case 'projects': res = await projectsApi.delete(id); break;
        case 'certifications': res = await certificationsApi.delete(id); break;
        case 'achievements': res = await achievementsApi.delete(id); break;
        case 'languages': res = await languagesApi.delete(id); break;
        default: return;
      }
      if (res?.success) {
        showNotification('success', 'Deleted successfully');
        fetchProfile();
      }
    } catch { showNotification('error', 'Failed to delete'); }
  };

  const resetNewItems = () => {
    setNewEducation(null);
    setNewExperience(null);
    setNewSkill(null);
    setNewProject(null);
    setNewCertification(null);
    setNewAchievement(null);
    setNewLanguage(null);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "personal", label: "Personal", icon: Mail },
    { id: "career", label: "Career", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "experience", label: "Experience", icon: Building },
    { id: "skills", label: "Skills", icon: Code },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "certifications", label: "Certs", icon: Award },
    { id: "achievements", label: "Achievements", icon: Star },
    { id: "languages", label: "Languages", icon: Languages },
    { id: "resume", label: "Resume", icon: FileText },
    { id: "preferences", label: "Preferences", icon: Target },
    { id: "ats", label: "ATS Score", icon: BarChart3 },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  const profileCompletionPct = typeof profile.profileCompletion === 'object' && profile.profileCompletion !== null
    ? (profile.profileCompletion as any).percentage ?? 0
    : (profile.profileCompletion as number) || 0;

  const atsScoreNum = typeof profile.atsScore === 'object' && profile.atsScore !== null
    ? (profile.atsScore as any).overall ?? 0
    : (profile.atsScore as number) || 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {notification.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {notification.message}
        </div>
      )}

      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
        <div className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-purple-100/50 blur-3xl" />
        
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start">
          {/* Profile Photo & Basic Info */}
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white shadow-lg">
              {profile.user.profileImage ? (
                <img src={profile.user.profileImage} alt="" className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <span>{profile.user.firstName?.[0]}{profile.user.lastName?.[0]}</span>
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {profile.user.firstName} {profile.user.lastName}
              </h1>
              <p className="text-sm font-medium text-slate-500">
                {profile.professionalHeadline || "Job Seeker"}
              </p>
              <p className="text-xs text-slate-400">{profile.user.email}</p>
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                {profile.candidateType === 'EXPERIENCED' ? 'Experienced' : 'Student / Fresher'}
              </span>
            </div>
          </div>

          {/* Score Cards */}
          <div className="flex flex-1 flex-wrap gap-4 md:justify-end">
            {/* Profile Completion */}
            <div className="min-w-[160px] rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-xs font-medium text-slate-500">Profile Completion</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-900">{profileCompletionPct}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                  style={{ width: `${profileCompletionPct}%` }}
                />
              </div>
            </div>

            {/* ATS Score */}
            <div className="min-w-[160px] rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-xs font-medium text-slate-500">ATS Profile Score</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-900">{atsScoreNum}</span>
                <span className="mb-0.5 text-sm text-slate-400">/ 100</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full transition-all ${
                    atsScoreNum >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                    atsScoreNum >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${atsScoreNum}%` }}
                />
              </div>
            </div>

            {/* Open to Work */}
            <div className="min-w-[120px] rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
              <p className="text-xs font-medium text-slate-500">Open to Work</p>
              <p className={`mt-2 text-lg font-bold ${profile.openToWork ? 'text-emerald-600' : 'text-slate-400'}`}>
                {profile.openToWork ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full shrink-0 lg:w-56">
          <nav className="sticky top-24 flex flex-row gap-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm lg:flex-col lg:overflow-x-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <OverviewTab
              profile={profile}
              atsData={atsData}
              completionData={completionData}
              onNavigate={handleTabChange}
            />
          )}

          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <PersonalTab
              profile={profile}
              form={personalForm}
              setForm={setPersonalForm}
              editing={editingSection === 'personal'}
              onEdit={() => setEditingSection('personal')}
              onSave={savePersonalInfo}
              onCancel={() => setEditingSection(null)}
              saving={saving}
            />
          )}

          {/* Career Info Tab */}
          {activeTab === "career" && (
            <CareerTab
              profile={profile}
              form={careerForm}
              setForm={setCareerForm}
              editing={editingSection === 'career'}
              onEdit={() => setEditingSection('career')}
              onSave={saveCareerInfo}
              onCancel={() => setEditingSection(null)}
              saving={saving}
            />
          )}

          {/* Education Tab */}
          {activeTab === "education" && (
            <EducationTab
              items={profile.education}
              newItem={newEducation}
              setNewItem={setNewEducation}
              onAdd={(data) => addSectionItem('education', data)}
              onDelete={(id) => deleteSectionItem('education', id)}
              saving={saving}
            />
          )}

          {/* Experience Tab */}
          {activeTab === "experience" && (
            <ExperienceTab
              items={profile.experience}
              candidateType={profile.candidateType}
              newItem={newExperience}
              setNewItem={setNewExperience}
              onAdd={(data) => addSectionItem('experience', data)}
              onDelete={(id) => deleteSectionItem('experience', id)}
              saving={saving}
            />
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <SkillsTab
              items={profile.skills}
              newItem={newSkill}
              setNewItem={setNewSkill}
              onAdd={(data) => addSectionItem('skills', data)}
              onDelete={(id) => deleteSectionItem('skills', id)}
              saving={saving}
            />
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <ProjectsTab
              items={profile.projects}
              newItem={newProject}
              setNewItem={setNewProject}
              onAdd={(data) => addSectionItem('projects', data)}
              onDelete={(id) => deleteSectionItem('projects', id)}
              saving={saving}
            />
          )}

          {/* Certifications Tab */}
          {activeTab === "certifications" && (
            <CertificationsTab
              items={profile.certifications}
              newItem={newCertification}
              setNewItem={setNewCertification}
              onAdd={(data) => addSectionItem('certifications', data)}
              onDelete={(id) => deleteSectionItem('certifications', id)}
              saving={saving}
            />
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <AchievementsTab
              items={profile.achievements}
              newItem={newAchievement}
              setNewItem={setNewAchievement}
              onAdd={(data) => addSectionItem('achievements', data)}
              onDelete={(id) => deleteSectionItem('achievements', id)}
              saving={saving}
            />
          )}

          {/* Languages Tab */}
          {activeTab === "languages" && (
            <LanguagesTab
              items={profile.languages}
              newItem={newLanguage}
              setNewItem={setNewLanguage}
              onAdd={(data) => addSectionItem('languages', data)}
              onDelete={(id) => deleteSectionItem('languages', id)}
              saving={saving}
            />
          )}

          {/* Resume Tab */}
          {activeTab === "resume" && (
            <ResumeTab
              profile={profile}
              uploading={uploadingResume}
              onUpload={handleResumeUpload}
              fileInputRef={fileInputRef}
            />
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <PreferencesTab
              profile={profile}
              form={preferencesForm}
              setForm={setPreferencesForm}
              editing={editingSection === 'preferences'}
              onEdit={() => setEditingSection('preferences')}
              onSave={savePreferences}
              onCancel={() => setEditingSection(null)}
              saving={saving}
            />
          )}

          {/* ATS Score Tab */}
          {activeTab === "ats" && (
            <ATSTab
              atsData={atsData}
              profile={profile}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ──────────────────────────────────────
function OverviewTab({ profile, atsData, completionData, onNavigate }: any) {
  return (
    <div className="space-y-6">
      {/* Profile Health */}
      <SectionCard title="Profile Health" icon={AlertCircle}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-emerald-600 mb-2">Completed</p>
            {completionData?.completed?.map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <Check className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium text-amber-600 mb-2">Needs Attention</p>
            {completionData?.needsAttention?.map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => onNavigate('overview')}
          className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
        >
          <Zap className="h-4 w-4" />
          Complete Profile
        </button>
      </SectionCard>

      {/* Quick Actions */}
      <SectionCard title="Quick Actions" icon={Zap}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Upload Resume', tab: 'resume', icon: Upload },
            { label: 'Add Skills', tab: 'skills', icon: Code },
            { label: 'Add Experience', tab: 'experience', icon: Building },
            { label: 'Job Preferences', tab: 'preferences', icon: Target },
          ].map(({ label, tab, icon: Icon }) => (
            <button
              key={tab}
              onClick={() => onNavigate(tab)}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200/80 p-4 text-center transition-colors hover:border-blue-200 hover:bg-blue-50/50"
            >
              <Icon className="h-5 w-5 text-blue-500" />
              <span className="text-xs font-medium text-slate-700">{label}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Skills Summary */}
      {profile.skills.length > 0 && (
        <SectionCard title="Top Skills" icon={Code}>
          <div className="flex flex-wrap gap-2">
            {profile.skills.slice(0, 10).map((skill: any) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                {skill.skillName}
                {skill.isAutoFilled && (
                  <span className="text-[10px] text-blue-500">Auto</span>
                )}
              </span>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ─── PERSONAL INFO TAB ─────────────────────────────────
function PersonalTab({ profile, form, setForm, editing, onEdit, onSave, onCancel, saving }: any) {
  return (
    <SectionCard
      title="Personal Information"
      icon={User}
      editing={editing}
      onEdit={onEdit}
      onSave={onSave}
      onCancel={onCancel}
      saving={saving}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name" value={`${profile.user.firstName} ${profile.user.lastName}`} disabled />
        <Field label="Email" value={profile.user.email} disabled />
        <EditableField label="Phone" value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} editing={editing} placeholder="+1 234 567 890" />
        <EditableField label="Location" value={form.location} onChange={(v: string) => setForm({ ...form, location: v })} editing={editing} placeholder="New York, NY" />
        <EditableField label="City" value={form.city} onChange={(v: string) => setForm({ ...form, city: v })} editing={editing} />
        <EditableField label="State" value={form.state} onChange={(v: string) => setForm({ ...form, state: v })} editing={editing} />
        <EditableField label="Country" value={form.country} onChange={(v: string) => setForm({ ...form, country: v })} editing={editing} />
        <EditableField label="LinkedIn" value={form.linkedinUrl} onChange={(v: string) => setForm({ ...form, linkedinUrl: v })} editing={editing} placeholder="https://linkedin.com/in/..." />
        <EditableField label="GitHub" value={form.githubUrl} onChange={(v: string) => setForm({ ...form, githubUrl: v })} editing={editing} placeholder="https://github.com/..." />
        <EditableField label="Portfolio" value={form.portfolioUrl} onChange={(v: string) => setForm({ ...form, portfolioUrl: v })} editing={editing} placeholder="https://..." />
        <EditableField label="Website" value={form.website} onChange={(v: string) => setForm({ ...form, website: v })} editing={editing} placeholder="https://..." />
      </div>
    </SectionCard>
  );
}

// ─── CAREER INFO TAB ───────────────────────────────────
function CareerTab({ profile, form, setForm, editing, onEdit, onSave, onCancel, saving }: any) {
  return (
    <SectionCard
      title="Career Information"
      icon={Briefcase}
      editing={editing}
      onEdit={onEdit}
      onSave={onSave}
      onCancel={onCancel}
      saving={saving}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Candidate Type</label>
          {editing ? (
            <select
              value={form.candidateType}
              onChange={(e) => setForm({ ...form, candidateType: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50"
            >
              <option value="STUDENT_FRESHER">Student / Fresher</option>
              <option value="EXPERIENCED">Experienced</option>
            </select>
          ) : (
            <p className="text-sm text-slate-700">{form.candidateType === 'EXPERIENCED' ? 'Experienced' : 'Student / Fresher'}</p>
          )}
        </div>
        <EditableField label="Professional Headline" value={form.professionalHeadline} onChange={(v: string) => setForm({ ...form, professionalHeadline: v })} editing={editing} placeholder="e.g., Full Stack Developer" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Professional Summary</label>
          {editing ? (
            <textarea
              value={form.professionalSummary}
              onChange={(e) => setForm({ ...form, professionalSummary: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50"
              placeholder="Write a brief professional summary..."
            />
          ) : (
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{form.professionalSummary || 'Not set'}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Target Job Titles</label>
          {editing ? (
            <TagInput
              tags={form.targetJobTitles || []}
              onChange={(tags: string[]) => setForm({ ...form, targetJobTitles: tags })}
              placeholder="Add target job titles..."
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {(form.targetJobTitles || []).map((t: string, i: number) => (
                <span key={i} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">{t}</span>
              ))}
              {(!form.targetJobTitles || form.targetJobTitles.length === 0) && <p className="text-sm text-slate-400">Not set</p>}
            </div>
          )}
        </div>
        <EditableField label="Preferred Industry" value={form.preferredIndustry} onChange={(v: string) => setForm({ ...form, preferredIndustry: v })} editing={editing} placeholder="e.g., Technology, Healthcare" />
      </div>
    </SectionCard>
  );
}

// ─── EDUCATION TAB ─────────────────────────────────────
function EducationTab({ items, newItem, setNewItem, onAdd, onDelete, saving }: any) {
  return (
    <div className="space-y-4">
      <SectionCard title="Education" icon={GraduationCap}>
        {items.length === 0 && !newItem && (
          <p className="text-sm text-slate-400">No education added yet.</p>
        )}
        {items.map((edu: any) => (
          <div key={edu.id} className="flex items-start justify-between rounded-xl border border-slate-100 p-4">
            <div>
              <p className="font-medium text-slate-900">{edu.degree || 'Degree'} {edu.fieldOfStudy && `- ${edu.fieldOfStudy}`}</p>
              <p className="text-sm text-slate-600">{edu.collegeUniversity}</p>
              <p className="text-xs text-slate-400">
                {edu.startYear} - {edu.isCurrentlyStudying ? 'Present' : edu.graduationYear}
                {edu.cgpaPercentage && ` | CGPA: ${edu.cgpaPercentage}`}
              </p>
            </div>
            <button onClick={() => onDelete(edu.id)} className="text-slate-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {newItem && (
          <EducationForm data={newItem} setData={setNewItem} onSave={() => onAdd(newItem)} onCancel={() => setNewItem(null)} saving={saving} />
        )}
        
        {!newItem && (
          <button
            onClick={() => setNewItem({ degree: '', fieldOfStudy: '', collegeUniversity: '', startYear: '', graduationYear: '', cgpaPercentage: '', isCurrentlyStudying: false })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <Plus className="h-4 w-4" />
            Add Education
          </button>
        )}
      </SectionCard>
    </div>
  );
}

function EducationForm({ data, setData, onSave, onCancel, saving }: any) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input placeholder="Degree" value={data.degree} onChange={(e) => setData({ ...data, degree: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input placeholder="Field of Study" value={data.fieldOfStudy} onChange={(e) => setData({ ...data, fieldOfStudy: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input placeholder="College / University" value={data.collegeUniversity} onChange={(e) => setData({ ...data, collegeUniversity: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input placeholder="Start Year" type="number" value={data.startYear} onChange={(e) => setData({ ...data, startYear: e.target.value ? parseInt(e.target.value) : '' })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input placeholder="Graduation Year" type="number" value={data.graduationYear} onChange={(e) => setData({ ...data, graduationYear: e.target.value ? parseInt(e.target.value) : '' })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input placeholder="CGPA / Percentage" type="number" step="0.01" value={data.cgpaPercentage} onChange={(e) => setData({ ...data, cgpaPercentage: e.target.value ? parseFloat(e.target.value) : '' })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={data.isCurrentlyStudying} onChange={(e) => setData({ ...data, isCurrentlyStudying: e.target.checked })} className="rounded" />
        Currently studying here
      </label>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={saving} className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          <Save className="h-4 w-4" /> Save
        </button>
        <button onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── EXPERIENCE TAB ────────────────────────────────────
function ExperienceTab({ items, candidateType, newItem, setNewItem, onAdd, onDelete, saving }: any) {
  const isFresher = candidateType === 'STUDENT_FRESHER';
  return (
    <div className="space-y-4">
      <SectionCard title={isFresher ? 'Internships / Training' : 'Work Experience'} icon={Building}>
        {items.length === 0 && !newItem && (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400 mb-3">
              {isFresher ? 'No internships added yet.' : 'No experience added yet.'}
            </p>
            {isFresher && (
              <p className="text-xs text-slate-400">No professional experience yet? That's okay! Add projects instead.</p>
            )}
          </div>
        )}
        {items.map((exp: any) => (
          <div key={exp.id} className="flex items-start justify-between rounded-xl border border-slate-100 p-4">
            <div className="flex-1">
              <p className="font-medium text-slate-900">{exp.jobTitle || 'Role'} {exp.company && `at ${exp.company}`}</p>
              <p className="text-sm text-slate-600">{exp.employmentType} {exp.location && `| ${exp.location}`}</p>
              <p className="text-xs text-slate-400">
                {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} - {exp.isCurrentlyWorking ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}
              </p>
              {exp.responsibilities && <p className="mt-2 text-sm text-slate-600 line-clamp-2">{exp.responsibilities}</p>}
              {exp.technologies?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {exp.technologies.map((t: string, i: number) => (
                    <span key={i} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => onDelete(exp.id)} className="text-slate-400 hover:text-red-500 ml-3">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {newItem && (
          <ExperienceForm data={newItem} setData={setNewItem} onSave={() => onAdd(newItem)} onCancel={() => setNewItem(null)} saving={saving} />
        )}

        {!newItem && (
          <button
            onClick={() => setNewItem({ company: '', jobTitle: '', employmentType: '', location: '', startDate: '', endDate: '', isCurrentlyWorking: false, responsibilities: '', achievements: '', technologies: [], isInternship: isFresher })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <Plus className="h-4 w-4" />
            {isFresher ? 'Add Internship' : 'Add Experience'}
          </button>
        )}
      </SectionCard>
    </div>
  );
}

function ExperienceForm({ data, setData, onSave, onCancel, saving }: any) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input placeholder="Company" value={data.company} onChange={(e) => setData({ ...data, company: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input placeholder="Job Title / Role" value={data.jobTitle} onChange={(e) => setData({ ...data, jobTitle: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <select value={data.employmentType} onChange={(e) => setData({ ...data, employmentType: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400">
          <option value="">Employment Type</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
        <input placeholder="Location" value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input placeholder="Start Date" type="date" value={data.startDate} onChange={(e) => setData({ ...data, startDate: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <input placeholder="End Date" type="date" value={data.endDate} onChange={(e) => setData({ ...data, endDate: e.target.value })} disabled={data.isCurrentlyWorking} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:opacity-50" />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={data.isCurrentlyWorking} onChange={(e) => setData({ ...data, isCurrentlyWorking: e.target.checked, endDate: e.target.checked ? '' : data.endDate })} className="rounded" />
        Currently working here
      </label>
      <textarea placeholder="Responsibilities" value={data.responsibilities} onChange={(e) => setData({ ...data, responsibilities: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
      <textarea placeholder="Technologies (comma-separated)" value={data.technologies?.join(', ')} onChange={(e) => setData({ ...data, technologies: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
      <div className="flex gap-2">
        <button onClick={onSave} disabled={saving} className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          <Save className="h-4 w-4" /> Save
        </button>
        <button onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── SKILLS TAB ────────────────────────────────────────
function SkillsTab({ items, newItem, setNewItem, onAdd, onDelete, saving }: any) {
  const categories = [
    { value: 'TECHNICAL', label: 'Technical' },
    { value: 'PROGRAMMING_LANGUAGE', label: 'Programming Language' },
    { value: 'FRAMEWORK', label: 'Framework' },
    { value: 'LIBRARY', label: 'Library' },
    { value: 'DATABASE', label: 'Database' },
    { value: 'CLOUD', label: 'Cloud' },
    { value: 'TOOL', label: 'Tool' },
    { value: 'SOFT_SKILL', label: 'Soft Skill' },
    { value: 'OTHER', label: 'Other' },
  ];

  const levels = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'EXPERT', label: 'Expert' },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Skills" icon={Code}>
        {items.length === 0 && !newItem && (
          <p className="text-sm text-slate-400">No skills added yet.</p>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((skill: any) => (
            <div key={skill.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800">{skill.skillName}</span>
                {skill.isAutoFilled && (
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-500">Auto-filled</span>
                )}
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{skill.category}</span>
              </div>
              <button onClick={() => onDelete(skill.id)} className="text-slate-400 hover:text-red-500">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {newItem && (
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input placeholder="Skill Name" value={newItem.skillName} onChange={(e) => setNewItem({ ...newItem, skillName: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400">
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select value={newItem.skillLevel || ''} onChange={(e) => setNewItem({ ...newItem, skillLevel: e.target.value || undefined })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400">
                <option value="">Select Level</option>
                {levels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onAdd(newItem)} disabled={saving || !newItem.skillName} className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                <Save className="h-4 w-4" /> Save
              </button>
              <button onClick={() => setNewItem(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        )}

        {!newItem && (
          <button
            onClick={() => setNewItem({ skillName: '', category: 'TECHNICAL', skillLevel: undefined })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <Plus className="h-4 w-4" />
            Add Skill
          </button>
        )}
      </SectionCard>
    </div>
  );
}

// ─── PROJECTS TAB ──────────────────────────────────────
function ProjectsTab({ items, newItem, setNewItem, onAdd, onDelete, saving }: any) {
  return (
    <div className="space-y-4">
      <SectionCard title="Projects" icon={FolderOpen}>
        {items.length === 0 && !newItem && (
          <p className="text-sm text-slate-400">No projects added yet.</p>
        )}
        {items.map((proj: any) => (
          <div key={proj.id} className="flex items-start justify-between rounded-xl border border-slate-100 p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900">{proj.projectName}</p>
                {proj.githubUrl && (
                  <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600">
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {proj.liveDemoUrl && (
                  <a href={proj.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              {proj.description && <p className="mt-1 text-sm text-slate-600 line-clamp-2">{proj.description}</p>}
              {proj.technologies?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {proj.technologies.map((t: string, i: number) => (
                    <span key={i} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => onDelete(proj.id)} className="text-slate-400 hover:text-red-500 ml-3">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {newItem && (
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input placeholder="Project Name" value={newItem.projectName} onChange={(e) => setNewItem({ ...newItem, projectName: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <input placeholder="Role" value={newItem.role} onChange={(e) => setNewItem({ ...newItem, role: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <input placeholder="GitHub URL" value={newItem.githubUrl} onChange={(e) => setNewItem({ ...newItem, githubUrl: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <input placeholder="Live Demo URL" value={newItem.liveDemoUrl} onChange={(e) => setNewItem({ ...newItem, liveDemoUrl: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <textarea placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            <input placeholder="Technologies (comma-separated)" value={newItem.technologies?.join(', ')} onChange={(e) => setNewItem({ ...newItem, technologies: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            <div className="flex gap-2">
              <button onClick={() => onAdd(newItem)} disabled={saving || !newItem.projectName} className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                <Save className="h-4 w-4" /> Save
              </button>
              <button onClick={() => setNewItem(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        )}

        {!newItem && (
          <button
            onClick={() => setNewItem({ projectName: '', description: '', role: '', technologies: [], githubUrl: '', liveDemoUrl: '' })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        )}
      </SectionCard>
    </div>
  );
}

// ─── CERTIFICATIONS TAB ────────────────────────────────
function CertificationsTab({ items, newItem, setNewItem, onAdd, onDelete, saving }: any) {
  return (
    <div className="space-y-4">
      <SectionCard title="Certifications" icon={Award}>
        {items.length === 0 && !newItem && (
          <p className="text-sm text-slate-400">No certifications added yet.</p>
        )}
        {items.map((cert: any) => (
          <div key={cert.id} className="flex items-start justify-between rounded-xl border border-slate-100 p-4">
            <div>
              <p className="font-medium text-slate-900">{cert.certificationName}</p>
              <p className="text-sm text-slate-600">{cert.issuingOrganization}</p>
              <p className="text-xs text-slate-400">
                {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : ''}
                {cert.expiryDate && ` - ${new Date(cert.expiryDate).toLocaleDateString()}`}
              </p>
              {cert.credentialUrl && (
                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600">
                  View Credential <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <button onClick={() => onDelete(cert.id)} className="text-slate-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {newItem && (
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input placeholder="Certification Name" value={newItem.certificationName} onChange={(e) => setNewItem({ ...newItem, certificationName: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <input placeholder="Issuing Organization" value={newItem.issuingOrganization} onChange={(e) => setNewItem({ ...newItem, issuingOrganization: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <input placeholder="Issue Date" type="date" value={newItem.issueDate} onChange={(e) => setNewItem({ ...newItem, issueDate: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <input placeholder="Expiry Date" type="date" value={newItem.expiryDate} onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <input placeholder="Credential ID" value={newItem.credentialId} onChange={(e) => setNewItem({ ...newItem, credentialId: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <input placeholder="Credential URL" value={newItem.credentialUrl} onChange={(e) => setNewItem({ ...newItem, credentialUrl: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => onAdd(newItem)} disabled={saving || !newItem.certificationName} className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                <Save className="h-4 w-4" /> Save
              </button>
              <button onClick={() => setNewItem(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        )}

        {!newItem && (
          <button
            onClick={() => setNewItem({ certificationName: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '' })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <Plus className="h-4 w-4" />
            Add Certification
          </button>
        )}
      </SectionCard>
    </div>
  );
}

// ─── ACHIEVEMENTS TAB ──────────────────────────────────
function AchievementsTab({ items, newItem, setNewItem, onAdd, onDelete, saving }: any) {
  return (
    <div className="space-y-4">
      <SectionCard title="Achievements" icon={Star}>
        {items.length === 0 && !newItem && (
          <p className="text-sm text-slate-400">No achievements added yet.</p>
        )}
        {items.map((ach: any) => (
          <div key={ach.id} className="flex items-start justify-between rounded-xl border border-slate-100 p-4">
            <div>
              <p className="font-medium text-slate-900">{ach.title}</p>
              {ach.description && <p className="text-sm text-slate-600">{ach.description}</p>}
              <p className="text-xs text-slate-400">
                {ach.organization && `${ach.organization} | `}
                {ach.date ? new Date(ach.date).toLocaleDateString() : ''}
                {ach.achievementType && ` | ${ach.achievementType}`}
              </p>
            </div>
            <button onClick={() => onDelete(ach.id)} className="text-slate-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {newItem && (
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input placeholder="Achievement Title" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <input placeholder="Organization" value={newItem.organization} onChange={(e) => setNewItem({ ...newItem, organization: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <input placeholder="Date" type="date" value={newItem.date} onChange={(e) => setNewItem({ ...newItem, date: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <select value={newItem.achievementType || ''} onChange={(e) => setNewItem({ ...newItem, achievementType: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400">
                <option value="">Type</option>
                <option value="Award">Award</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Competition">Competition</option>
                <option value="Publication">Publication</option>
                <option value="Leadership">Leadership</option>
                <option value="Academic">Academic</option>
              </select>
            </div>
            <textarea placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
            <div className="flex gap-2">
              <button onClick={() => onAdd(newItem)} disabled={saving || !newItem.title} className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                <Save className="h-4 w-4" /> Save
              </button>
              <button onClick={() => setNewItem(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        )}

        {!newItem && (
          <button
            onClick={() => setNewItem({ title: '', description: '', organization: '', date: '', achievementType: '' })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <Plus className="h-4 w-4" />
            Add Achievement
          </button>
        )}
      </SectionCard>
    </div>
  );
}

// ─── LANGUAGES TAB ─────────────────────────────────────
function LanguagesTab({ items, newItem, setNewItem, onAdd, onDelete, saving }: any) {
  const proficiencies = [
    { value: 'BASIC', label: 'Basic' },
    { value: 'CONVERSATIONAL', label: 'Conversational' },
    { value: 'PROFESSIONAL', label: 'Professional' },
    { value: 'FLUENT', label: 'Fluent' },
    { value: 'NATIVE', label: 'Native' },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Languages" icon={Languages}>
        {items.length === 0 && !newItem && (
          <p className="text-sm text-slate-400">No languages added yet.</p>
        )}
        {items.map((lang: any) => (
          <div key={lang.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
            <div>
              <span className="font-medium text-slate-900">{lang.language}</span>
              <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{lang.proficiency}</span>
            </div>
            <button onClick={() => onDelete(lang.id)} className="text-slate-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {newItem && (
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input placeholder="Language" value={newItem.language} onChange={(e) => setNewItem({ ...newItem, language: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400" />
              <select value={newItem.proficiency} onChange={(e) => setNewItem({ ...newItem, proficiency: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400">
                {proficiencies.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onAdd(newItem)} disabled={saving || !newItem.language} className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                <Save className="h-4 w-4" /> Save
              </button>
              <button onClick={() => setNewItem(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        )}

        {!newItem && (
          <button
            onClick={() => setNewItem({ language: '', proficiency: 'PROFESSIONAL' })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <Plus className="h-4 w-4" />
            Add Language
          </button>
        )}
      </SectionCard>
    </div>
  );
}

// ─── RESUME TAB ────────────────────────────────────────
function ResumeTab({ profile, uploading, onUpload, fileInputRef }: any) {
  return (
    <div className="space-y-4">
      <SectionCard title="Resume" icon={FileText}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={onUpload}
          className="hidden"
        />
        
        {profile.resume ? (
          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{profile.resume.fileName}</p>
                  <p className="text-xs text-slate-400">
                    Uploaded {new Date(profile.resume.uploadedAt).toLocaleDateString()} | Version {profile.resume.version}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${profile.resume.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" /> View
                </a>
                <a
                  href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${profile.resume.fileUrl}`}
                  download
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" /> Download
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No resume uploaded yet</p>
            <p className="text-xs text-slate-400 mt-1">Upload a resume to auto-fill your profile and get an ATS score</p>
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 py-4 text-sm font-medium text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-100/50 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Uploading & Parsing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {profile.resume ? 'Replace Resume' : 'Upload Resume'}
            </>
          )}
        </button>

        <p className="mt-3 text-xs text-slate-400">
          Supported formats: PDF, DOC, DOCX, TXT. Max size: 10MB.
          Your resume will be parsed to auto-fill profile fields.
        </p>
      </SectionCard>
    </div>
  );
}

// ─── PREFERENCES TAB ───────────────────────────────────
function PreferencesTab({ profile, form, setForm, editing, onEdit, onSave, onCancel, saving }: any) {
  const workModes = ['REMOTE', 'HYBRID', 'ONSITE'];
  const empTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'];

  return (
    <SectionCard
      title="Job Preferences"
      icon={Target}
      editing={editing}
      onEdit={onEdit}
      onSave={onSave}
      onCancel={onCancel}
      saving={saving}
    >
      <div className="space-y-4">
        <EditableField label="Expected Salary" value={form.expectedSalary} onChange={(v: string) => setForm({ ...form, expectedSalary: v ? parseFloat(v) : '' })} editing={editing} type="number" placeholder="e.g., 75000" />
        
        {profile.candidateType === 'EXPERIENCED' && (
          <>
            <EditableField label="Current Salary" value={form.currentSalary} onChange={(v: string) => setForm({ ...form, currentSalary: v ? parseFloat(v) : '' })} editing={editing} type="number" />
            <EditableField label="Notice Period" value={form.noticePeriod} onChange={(v: string) => setForm({ ...form, noticePeriod: v })} editing={editing} placeholder="e.g., 30 days" />
          </>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Work Mode Preference</label>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {workModes.map(mode => (
                <label key={mode} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  form.workModePreference?.includes(mode) ? 'border-blue-300 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={form.workModePreference?.includes(mode)}
                    onChange={(e) => {
                      const current = form.workModePreference || [];
                      setForm({
                        ...form,
                        workModePreference: e.target.checked
                          ? [...current, mode]
                          : current.filter((m: string) => m !== mode)
                      });
                    }}
                    className="sr-only"
                  />
                  {mode.charAt(0) + mode.slice(1).toLowerCase()}
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(form.workModePreference || []).map((m: string) => (
                <span key={m} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">{m}</span>
              ))}
              {(!form.workModePreference || form.workModePreference.length === 0) && <p className="text-sm text-slate-400">Not set</p>}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Employment Type</label>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {empTypes.map(type => (
                <label key={type} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  form.employmentTypePref?.includes(type) ? 'border-blue-300 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={form.employmentTypePref?.includes(type)}
                    onChange={(e) => {
                      const current = form.employmentTypePref || [];
                      setForm({
                        ...form,
                        employmentTypePref: e.target.checked
                          ? [...current, type]
                          : current.filter((t: string) => t !== type)
                      });
                    }}
                    className="sr-only"
                  />
                  {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(form.employmentTypePref || []).map((t: string) => (
                <span key={t} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">{t.replace(/_/g, ' ')}</span>
              ))}
              {(!form.employmentTypePref || form.employmentTypePref.length === 0) && <p className="text-sm text-slate-400">Not set</p>}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Willing to Relocate</label>
          {editing ? (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.willingToRelocate}
                onChange={(e) => setForm({ ...form, willingToRelocate: e.target.checked })}
                className="rounded"
              />
              Yes, I am willing to relocate
            </label>
          ) : (
            <p className="text-sm text-slate-700">{form.willingToRelocate ? 'Yes' : 'No'}</p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── ATS SCORE TAB ─────────────────────────────────────
function ATSTab({ atsData, profile }: any) {
  if (!atsData) {
    return (
      <SectionCard title="ATS Profile Score" icon={BarChart3}>
        <p className="text-sm text-slate-400">Complete your profile to get an ATS score.</p>
      </SectionCard>
    );
  }

  const overall = typeof atsData === 'number' ? atsData : (atsData.overall ?? 0);

  const metrics = [
    { label: 'Keyword Match', value: atsData.keywordMatch ?? 0, barColor: 'bg-blue-500' },
    { label: 'Skills Match', value: atsData.skillsMatch ?? 0, barColor: 'bg-purple-500' },
    { label: 'Experience Match', value: atsData.experienceMatch ?? 0, barColor: 'bg-emerald-500' },
    { label: 'Education Match', value: atsData.educationMatch ?? 0, barColor: 'bg-amber-500' },
    { label: 'Job Title Match', value: atsData.jobTitleMatch ?? 0, barColor: 'bg-rose-500' },
    { label: 'Resume Structure', value: atsData.resumeStructure ?? 0, barColor: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <SectionCard title="ATS Profile Score" icon={BarChart3}>
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={overall >= 80 ? '#10b981' : overall >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={`${overall * 2.64} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{overall}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500">out of 100</p>
            <p className={`mt-1 font-medium ${
              overall >= 80 ? 'text-emerald-600' : overall >= 60 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {overall >= 80 ? 'Excellent' : overall >= 60 ? 'Good' : 'Needs Improvement'}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Score Breakdown */}
      <SectionCard title="Score Breakdown" icon={TrendingUp}>
        <div className="space-y-4">
          {metrics.map(({ label, value, barColor }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <span className="text-sm font-semibold text-slate-900">{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full ${barColor} transition-all`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Missing & Suggestions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {(atsData.missingKeywords?.length > 0 || atsData.missingSkills?.length > 0) && (
          <SectionCard title="Missing Keywords" icon={AlertCircle}>
            <div className="space-y-2">
              {atsData.missingKeywords?.map((kw: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <X className="h-3.5 w-3.5 text-red-400" />
                  {kw}
                </div>
              ))}
              {atsData.missingSkills?.map((sk: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <X className="h-3.5 w-3.5 text-red-400" />
                  {sk}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {atsData.suggestions?.length > 0 && (
          <SectionCard title="Improvement Suggestions" icon={Zap}>
            <div className="space-y-2">
              {atsData.suggestions.map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="mt-0.5 h-3.5 w-3.5 text-blue-400 shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

// ─── SHARED COMPONENTS ─────────────────────────────────
function SectionCard({ title, icon: Icon, children, editing, onEdit, onSave, onCancel, saving }: any) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-blue-500" />}
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
        {onEdit && !editing && (
          <button onClick={onEdit} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Edit3 className="h-4 w-4" /> Edit
          </button>
        )}
        {editing && (
          <div className="flex gap-2">
            <button onClick={onSave} disabled={saving} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onCancel} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, disabled }: { label: string; value: string; disabled?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-500">{label}</label>
      <p className="text-sm text-slate-800">{value || '—'}</p>
    </div>
  );
}

function EditableField({ label, value, onChange, editing, placeholder, type = 'text' }: any) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {editing ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50"
        />
      ) : (
        <p className="text-sm text-slate-700">{value || '—'}</p>
      )}
    </div>
  );
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (tags: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      onChange([...tags, input.trim()]);
      setInput('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-blue-800">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <button onClick={addTag} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
          Add
        </button>
      </div>
    </div>
  );
}
