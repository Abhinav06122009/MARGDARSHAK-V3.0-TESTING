import React from "react";
import logo from "@/components/logo/logo.png";

type Section = { id: number; slug: string; title: string; content: React.ReactNode };

const sections: Section[] = [
  {
    id: 1,
    slug: "introduction",
    title: "Introduction and Scope",
    content: (
      <>
        <p className="mb-5">
          This Cookie Policy (“Policy”) elucidates the modalities and purposes pursuant to which <strong>VSAV GYANTAPA</strong>,
          operating <strong>MARGDARSHAK</strong> (“we,” “us,” “our”), deploys cookies and analogous tracking technologies
          (collectively, “Cookies”) on our website, applications, and related interfaces (the “Services”).
        </p>
        <p className="mb-5">
          By continuing to engage our Services, you acknowledge notice of this Policy and our utilization of Cookies in
          accordance with the dispositions herein articulated. This instrument shall be read <em>in pari materia</em>
          with our Privacy Policy and Terms of Service.
        </p>
      </>
    ),
  },
  {
    id: 2,
    slug: "what-are-cookies",
    title: "What are Cookies?",
    content: (
      <>
        <p className="mb-5">
          Cookies comprise infinitesimal data packets—alphanumeric identifiers—that are sequestered on your local
          terminal (computer, smartphone, or tablet) when you access digital resources. They facilitate the
          preservation of state, recognize return visitations, and sustain persistent authentication or preference
          signals.
        </p>
        <p className="mb-5">
          These primitives may be “Session Cookies” (temporary artifacts deleted upon browser cessation) or
          “Persistent Cookies” (enduring nodes that persist for a predefined duration or until manual erasure).
        </p>
      </>
    ),
  },
  {
    id: 3,
    slug: "how-we-use-cookies",
    title: "Juridical Rationale: How We Use Cookies",
    content: (
      <>
        <p className="mb-5">
          The deployment of Cookies is strictly circumscribed by operational necessity, performance optimization,
          and the fulfillment of user-initiated desiderata. Specifically, Cookies enable:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li><strong>Authentication:</strong> Verification of identity and sustainment of secure session integrity.</li>
          <li><strong>Security:</strong> Anomaly detection, fraud interdiction, and mitigation of cross-site request forgery.</li>
          <li><strong>Preferences:</strong> Preservation of linguistic nodes, UI/UX configurations, and user-defined toggles.</li>
          <li><strong>Performance:</strong> Aggregated telemetry to instrument service velocity and resolve bottlenecks.</li>
        </ul>
      </>
    ),
  },
  {
    id: 4,
    slug: "categories",
    title: "Taxonomy of Cookies",
    content: (
      <>
        <p className="mb-5">We categorize our Cookies into the following functional tiers:</p>
        <ul className="list-disc list-inside space-y-3 mb-6">
          <li>
            <strong>Strictly Essential Cookies:</strong> Indispensable for the core operability of the Services.
            Absent these nodes, secure authentication and basic navigation cannot be effectuated.
          </li>
          <li>
            <strong>Functionality Cookies:</strong> Enable personalized attributes, such as remembering your
            archival configurations or selected dashboard layouts.
          </li>
          <li>
            <strong>Analytical/Performance Cookies:</strong> Facilitate pseudonymous telemetry to measure
            engagement metrics, error frequencies, and navigational paths.
          </li>
          <li>
            <strong>Targeting and Social Cookies:</strong> Where applicable, used to calibrate content relevance
            and facilitate social media integrations.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 5,
    slug: "third-party",
    title: "Third-Party Cookies and External SDKs",
    content: (
      <p className="mb-5">
        In certain contexts, Cookies may be deployed by vetted third-party providers (e.g., Supabase for
        authentication nodes, or Google Analytics for telemetry). These entities exercise independent control
        over their respective Cookies, governed by their own privacy and data protection postures. We counsel
        independent appraisal of their respective notices.
      </p>
    ),
  },
  {
    id: 6,
    slug: "managing-cookies",
    title: "Governance: Managing Your Preferences",
    content: (
      <>
        <p className="mb-5">
          You possess the inherent right to regulate Cookie deployment via browser-level configurations or system
          preferences. Most modern browsers allow you to:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>Inspect and selectively delete Cookies.</li>
          <li>Block third-party Cookies in <em>toto</em>.</li>
          <li>Inhibit all Cookie activity (note: this may render essential Services inoperable).</li>
          <li>Actuate “Incognito” or “Private” modes which purge local artifacts upon session termination.</li>
        </ul>
        <p className="mb-5">
          Where available, we honor Universal Opt-Out signals and “Do Not Track” (DNT) headers to the extent
          technically feasible within contemporary standards.
        </p>
      </>
    ),
  },
  {
    id: 7,
    slug: "modifications",
    title: "Modifications and Effective Date",
    content: (
      <p className="mb-5">
        This Policy may be modified to reflect technological evolutions or regulatory shifts. Material
        alterations shall be conspicuously noticed. Continued engagement with the Services following such notice
        constitutes acknowledgment of the recalibrated Policy.
      </p>
    ),
  },
  {
    id: 8,
    slug: "contact",
    title: "Contact and Inquiries",
    content: (
      <>
        <p className="mb-5">
          For clarifications respecting our Cookie governance or to invoke data subject rights, please direct
          communications to:
        </p>
        <address className="not-italic text-blue-700 font-medium">
          VSAV GYANTAPA — MARGDARSHAK
          <br />
          Email:{" "}
          <a
            href="mailto:support@margdarshan.tech"
            className="text-blue-600 underline hover:text-blue-800"
          >
            support@margdarshan.tech
          </a>
        </address>
      </>
    ),
  },
];

const CookiePolicy: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <div id="top" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-8">
          <div className="relative rounded-3xl border border-indigo-300/40 bg-white/70 backdrop-blur-xl shadow-2xl">
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-indigo-400/30" />
            <div className="flex flex-col md:flex-row items-center gap-6 px-8 py-10">
              <img
                src={logo}
                alt="MARGDARSHAK Logo"
                className="w-16 h-16 rounded bg-white shadow"
                draggable={false}
              />
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Cookie Policy
                </h1>
                <p className="mt-3 text-slate-600">
                  Transparency regarding our utilization of local storage nodes, telemetry trackers, and
                  session primitives.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Effective Date: <time dateTime="2025-07-25">July 25, 2025</time>
                </p>
              </div>
              {onBack && (
                <button
                  onClick={onBack}
                  className="rounded-full px-6 py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-300 transition"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sticky TOC */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-8">
              <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-xl p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Table of Contents</h2>
                <ol className="text-sm space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {sections.map((s) => (
                    <li key={s.id} className="group">
                      <a
                        href={`#section-${s.slug}`}
                        className="inline-flex items-start gap-2 text-slate-700 hover:text-indigo-700"
                      >
                        <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400/70 group-hover:bg-indigo-500" />
                        <span>
                          {s.id}. {s.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </aside>

          {/* Content */}
          <section className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-xl p-6 mb-8">
              <p className="text-lg text-slate-800">
                This Cookie Policy governs the utilization of tracking technologies by <strong>MARGDARSHAK</strong>.
                Our objective is to ensure that your experience is performant, secure, and personalized while
                maintaining the highest standards of transparency and user agency.
              </p>
            </div>

            {sections.map((s) => (
              <article
                key={s.slug}
                id={`section-${s.slug}`}
                className="group relative mb-8 rounded-2xl border border-slate-200 bg-white/90 shadow-xl transition hover:shadow-2xl"
              >
                <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-indigo-400 via-purple-400 to-indigo-500 opacity-80" />
                <header className="px-6 pt-6">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {s.id}. {s.title}
                  </h3>
                </header>
                <div className="px-6 py-5 text-slate-800 leading-relaxed">{s.content}</div>
              </article>
            ))}
          </section>
        </div>
      </main>

      {/* App Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="MARGDARSHAK Logo"
              className="w-14 h-14 object-contain bg-white rounded"
              draggable={false}
            />
            <div className="text-slate-800 text-sm">
              Maintained by <span className="font-semibold text-indigo-600">VSAV GYANTAPA</span>
              <br />
              © 2026 VSAV GYANTAPA. All Rights Reserved
            </div>
          </div>
          <a
            href="#top"
            className="inline-flex items-center gap-2 rounded-full border border-indigo-300/60 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-50 transition"
          >
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Back to top
          </a>
        </div>
      </footer>
    </div>
  );
};

export default CookiePolicy;
