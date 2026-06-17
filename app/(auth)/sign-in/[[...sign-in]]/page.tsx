import { SignIn } from "@clerk/nextjs";
import { Workflow, Users, FileText } from "lucide-react";

const features = [
  {
    icon: Workflow,
    title: "AI Architecture Generation",
    description:
      "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description:
      "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description:
      "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-[var(--bg-surface)] p-12 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
              <span className="text-sm font-bold text-[var(--bg-base)]">G</span>
            </div>
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              Ghost AI
            </span>
          </div>
          <div className="mt-24 max-w-md">
            <h1 className="text-4xl font-bold leading-tight text-[var(--text-primary)]">
              Design systems at the speed of thought.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
              Describe your architecture in plain English. Ghost AI maps it to a
              shared canvas your whole team can refine in real time.
            </p>
          </div>
          <div className="mt-12 space-y-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary)]/10">
                  <f.icon className="h-5 w-5 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-[var(--text-faint)]">
          © 2026 Ghost AI. All rights reserved.
        </p>
      </div>
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
