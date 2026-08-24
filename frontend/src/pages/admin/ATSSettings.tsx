import { Brain, Settings } from 'lucide-react';

export default function ATSSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">ATS Settings</h1>
        <p className="text-sm text-[#64748b] mt-1">Configure the ATS matching engine</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">
        <Brain className="w-12 h-12 text-[#e2e8f0] mx-auto mb-3" />
        <h3 className="font-bold text-[#0f172a] mb-2">ATS Engine Configuration</h3>
        <p className="text-sm text-[#94a3b8] max-w-md mx-auto">
          ATS settings are managed through Platform Settings. The matching engine uses the existing ATS configuration.
          Modify skills matching, keyword matching, experience matching, and education matching via Platform Settings.
        </p>
      </div>
    </div>
  );
}
