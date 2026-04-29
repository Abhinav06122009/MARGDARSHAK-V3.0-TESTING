import React from "react";
import logo from "@/components/logo/logo.png";

type Section = { id: number; slug: string; title: string; content: React.ReactNode };

const sections: Section[] = [
  {
    id: 1,
    slug: "introduction",
    title: "Commitment to GDPR Compliance",
    content: (
      <>
        <p className="mb-5">
          At <strong>MARGDARSHAK</strong>, operated by <strong>VSAV GYANTAPA</strong>, we recognize the paramount
          importance of data sovereignty and the fundamental rights of natural persons within the European Union
          (EU) and the European Economic Area (EEA). This document delineates our rigorous adherence to the
          General Data Protection Regulation (EU) 2016/679 (GDPR).
        </p>
        <p className="mb-5">
          We act as the “Data Controller” for the Personal Data of our users and are committed to maintaining a
          posture of absolute transparency, accountability, and security in all processing operations.
        </p>
      </>
    ),
  },
  {
    id: 2,
    slug: "principles",
    title: "Core Data Protection Principles",
    content: (
      <>
        <p className="mb-5">Our processing infrastructure is architected upon the following cardinal principles:</p>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li><strong>Lawfulness, Fairness, and Transparency:</strong> Processing is conducted on valid juridical bases and communicated clearly.</li>
          <li><strong>Purpose Limitation:</strong> Data is collected for specified, explicit, and legitimate purposes.</li>
          <li><strong>Data Minimization:</strong> We collect only the telemetry and identifiers strictly necessary for service delivery.</li>
          <li><strong>Accuracy:</strong> Reasonable measures are taken to ensure data is accurate and rectified without delay.</li>
          <li><strong>Storage Limitation:</strong> Data is retained only for as long as required for the disclosed purposes.</li>
          <li><strong>Integrity and Confidentiality:</strong> Utilization of advanced technical and organizational measures (TOMs) to prevent unauthorized access.</li>
        </ul>
      </>
    ),
  },
  {
    id: 3,
    slug: "rights",
    title: "User Rights and Prerogatives",
    content: (
      <>
        <p className="mb-5">Under the GDPR, you possess the following inalienable rights:</p>
        <ul className="list-disc list-inside space-y-3 mb-6">
          <li><strong>Right of Access:</strong> Obtain confirmation as to whether your data is being processed and receive a copy thereof.</li>
          <li><strong>Right to Rectification:</strong> Demand the correction of inaccurate or incomplete personal information.</li>
          <li><strong>Right to Erasure (“Right to be Forgotten”):</strong> Request the deletion of data where processing is no longer justified.</li>
          <li><strong>Right to Restriction of Processing:</strong> Contest the accuracy or lawfulness of processing and request suspension.</li>
          <li><strong>Right to Data Portability:</strong> Receive your data in a structured, commonly used, and machine-readable format.</li>
          <li><strong>Right to Object:</strong> Oppose processing predicated on legitimate interests or for direct marketing purposes.</li>
        </ul>
      </>
    ),
  },
  {
    id: 4,
    slug: "lawful-bases",
    title: "Juridical Bases for Processing",
    content: (
      <p className="mb-5">
        Processing is only undertaken where a valid lawful basis exists: either through <strong>Contractual Necessity</strong>
        (to provide the Services), <strong>Legal Obligation</strong> (to comply with statutory requirements),
        <strong>Legitimate Interests</strong> (for security and optimization), or <strong>Explicit Consent</strong>
        (for optional instrumentation).
      </p>
    ),
  },
  {
    id: 5,
    slug: "security",
    title: "Technical and Organizational Measures (TOMs)",
    content: (
      <p className="mb-5">
        We deploy a multi-layered security substrate including <strong>AES-256 encryption</strong> at rest,
        <strong>TLS 1.3</strong> for data in transit, multi-factor authentication (MFA), and periodic vulnerability
        assessments. Our infrastructure is hosted on vetted, SOC2-compliant cloud providers with stringent
        physical and logical access controls.
      </p>
    ),
  },
  {
    id: 6,
    slug: "subprocessors",
    title: "International Transfers and Sub-processors",
    content: (
      <p className="mb-5">
        Where data is transferred outside the EEA, we ensure adequacy through <strong>Standard Contractual Clauses (SCCs)</strong>
        and supplemental technical measures. All sub-processors are vetted for GDPR compliance and are bound by
        Data Processing Agreements (DPAs) that mirror our commitment to privacy.
      </p>
    ),
  },
  {
    id: 7,
    slug: "contact",
    title: "Contact and Data Protection Officer",
    content: (
      <>
        <p className="mb-5">
          For the invocation of your rights or to inquire regarding our compliance posture, please contact our
          Data Protection Function:
        </p>
        <address className="not-italic text-emerald-700 font-medium">
          VSAV GYANTAPA — MARGDARSHAK
          <br />
          Email:{" "}
          <a
            href="mailto:support@margdarshan.tech"
            className="text-emerald-600 underline hover:text-emerald-800"
          >
            support@margdarshan.tech
          </a>
        </address>
      </>
    ),
  },
];

const GDPRCompliance: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <div id="top" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/50">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-8">
          <div className="relative rounded-3xl border border-emerald-300/40 bg-white/70 backdrop-blur-xl shadow-2xl">
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-emerald-400/30" />
            <div className="flex flex-col md:flex-row items-center gap-6 px-8 py-10">
              <img
                src={logo}
                alt="MARGDARSHAK Logo"
                className="w-16 h-16 rounded bg-white shadow"
                draggable={false}
              />
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  GDPR Compliance
                </h1>
                <p className="mt-3 text-slate-600">
                  Detailed articulation of our commitment to European data protection standards and user rights.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Last Updated: <time dateTime="2025-07-25">July 25, 2025</time>
                </p>
              </div>
              {onBack && (
                <button
                  onClick={onBack}
                  className="rounded-full px-6 py-3 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-300 transition"
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
                <h2 className="text-lg font-bold text-slate-900 mb-4">Compliance Roadmap</h2>
                <ol className="text-sm space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {sections.map((s) => (
                    <li key={s.id} className="group">
                      <a
                        href={`#section-${s.slug}`}
                        className="inline-flex items-start gap-2 text-slate-700 hover:text-emerald-700"
                      >
                        <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/70 group-hover:bg-emerald-500" />
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
                The General Data Protection Regulation (GDPR) represents the gold standard of data protection.
                <strong> MARGDARSHAK</strong> is engineered with "Privacy by Design" at its core, ensuring that
                your data rights are protected through every layer of our technical architecture.
              </p>
            </div>

            {sections.map((s) => (
              <article
                key={s.slug}
                id={`section-${s.slug}`}
                className="group relative mb-8 rounded-2xl border border-slate-200 bg-white/90 shadow-xl transition hover:shadow-2xl"
              >
                <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-emerald-400 via-teal-400 to-emerald-500 opacity-80" />
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
    </div>
  );
};

export default GDPRCompliance;
