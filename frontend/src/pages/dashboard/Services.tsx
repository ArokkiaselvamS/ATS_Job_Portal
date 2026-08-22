import {
  FileCheck,
  ScanSearch,
  MessageCircle,
  Eye,
  Video,
  FilePen,
  Linkedin,
  BarChart3,
  SearchIcon,
  ArrowRight,
} from "lucide-react";
import { mockServices } from "../../data/mockData";

const iconMap: Record<string, any> = {
  "file-check": FileCheck,
  "scan-search": ScanSearch,
  "message-circle": MessageCircle,
  eye: Eye,
  video: Video,
  "file-pen": FilePen,
  linkedin: Linkedin,
  "bar-chart-3": BarChart3,
  search: SearchIcon,
};

export default function Services() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Career Services</h1>
        <p className="mt-1 text-[15px] text-slate-500">
          Professional tools and support to accelerate your career.
        </p>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockServices.map((service) => {
          const IconComp = iconMap[service.icon] || FileCheck;
          return (
            <div
              key={service.id}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-blue-100">
                <IconComp className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-900">{service.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">
                {service.description}
              </p>
              <button className="mt-5 flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
                {service.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
