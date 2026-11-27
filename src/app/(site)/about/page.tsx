import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExperienceList, SectionHead, StepCards } from "@/components/site/home/sections";
import { PageHero } from "@/components/site/page-hero";
import { GenerativeCover } from "@/components/site/project-cover";
import { getCertifications, getEducation, getExperience, getProfile } from "@/lib/content/queries";
import { isExternal, pad2 } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: "Background, experience and engineering philosophy.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [profile, experience, education, certifications] = await Promise.all([
    getProfile(),
    getExperience(),
    getEducation(),
    getCertifications(),
  ]);

  const socials = [
    ...(profile.email ? [{ label: "Email", url: `mailto:${profile.email}`, handle: profile.email }] : []),
    ...profile.socials.map((s) => ({ ...s, handle: s.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") })),
    ...(profile.resume_url ? [{ label: "Résumé", url: profile.resume_url, handle: "Download PDF" }] : []),
  ];

  return (
    <>
      <PageHero index="02" eyebrow="About" heading={profile.about_intro || profile.title} />

      {/* Maintainer-style introduction: photo, copy, social list */}
      <section className="maintainer" aria-labelledby="about-name">
        <div className="shell maintainer-grid">
          <figure className="maintainer-photo">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={`Portrait of ${profile.name}`} width={240} height={240} />
            ) : (
              <div className="relative aspect-square overflow-hidden border border-ink bg-surface shadow-[var(--shadow-hard)]">
                <GenerativeCover seed={`about-${profile.name}`} label={profile.title} />
              </div>
            )}
            <figcaption>FIG_ME · {profile.location || "portrait"}</figcaption>
          </figure>
          <div className="maintainer-copy">
            <span className="eyebrow">Introduction</span>
            <h2 id="about-name">{profile.name}</h2>
            {profile.title ? <p className="maintainer-role">{profile.title}</p> : null}
            {profile.about_body ? (
              <div className="prose-site !text-[1.02rem]" dangerouslySetInnerHTML={{ __html: profile.about_body }} />
            ) : null}
            <div className="maintainer-actions">
              <Link href="/contact" className="btn btn-primary">
                Get in touch
              </Link>
              {profile.resume_url ? (
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="btn">
                  Download résumé
                </a>
              ) : null}
            </div>
          </div>
          {socials.length > 0 ? (
            <nav className="social-list" aria-label="Profiles">
              {socials.map((social) => (
                <a
                  key={social.url}
                  href={social.url}
                  className="social-row !grid-cols-[5.5rem_minmax(0,1fr)]"
                  {...(isExternal(social.url) && !social.url.startsWith("mailto:")
                    ? { target: "_blank", rel: "noopener noreferrer me" }
                    : {})}
                >
                  <span className="social-label">{social.label}</span>
                  <span className="social-handle truncate">{social.handle}</span>
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </section>

      {/* Career journey: two-column preface with a drop cap */}
      {profile.journey ? (
        <section className="bp-section">
          <div className="shell">
            <h2 className="stat-title">01 · Career journey</h2>
            <div className="preface-body" dangerouslySetInnerHTML={{ __html: profile.journey }} />
          </div>
        </section>
      ) : null}

      {/* Areas of interest: phase cards */}
      {profile.interests.length > 0 ? (
        <section className="toc">
          <div className="shell">
            <div className="toc-title">02 · Areas of interest</div>
            <div className="toc-subtitle">What I like working on, and keep coming back to.</div>
            <div className="phase-grid">
              {profile.interests.map((interest, i) => (
                <div key={interest.title + i} className="phase-card">
                  <div className="phase-card-top">
                    <span className="phase-card-num">
                      <i className="status complete" aria-hidden />
                      Interest {pad2(i + 1)}
                    </span>
                  </div>
                  <h3 className="phase-card-name">{interest.title}</h3>
                  <p className="phase-card-desc">{interest.body}</p>
                  <div className="phase-card-bar">
                    <span style={{ width: `${Math.round(((i + 1) / profile.interests.length) * 100)}%` }} />
                  </div>
                  <div className="phase-card-foot">
                    <span>
                      {pad2(i + 1)} / {pad2(profile.interests.length)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Technical philosophy: step cards */}
      {profile.philosophy.length > 0 ? (
        <section className="bp-section">
          <div className="shell">
            <SectionHead index="03" eyebrow="Technical philosophy" heading="How I think about *engineering.*" />
            <StepCards items={profile.philosophy} />
          </div>
        </section>
      ) : null}

      {/* Experience */}
      {experience.length > 0 ? (
        <section className="bp-section">
          <div className="shell">
            <SectionHead index="04" eyebrow="Experience" heading="Where I have been *building.*" />
            <ExperienceList items={experience} />
          </div>
        </section>
      ) : null}

      {/* Certifications as the reference "book" covers */}
      {certifications.length > 0 ? (
        <section className="books">
          <div className="shell">
            <h2 className="stat-title !mb-2">05 · Certifications</h2>
            <div className="books-grid">
              {certifications.map((item, i) => (
                <article key={item.id} className="book">
                  <div className="book-cover">
                    <span className="book-vol">
                      {[item.issuer, item.year].filter(Boolean).join(" · ") || `No. ${pad2(i + 1)}`}
                    </span>
                    <span className="book-name">{item.name}</span>
                    <span className="book-glyph" aria-hidden>
                      {pad2(i + 1)}
                    </span>
                  </div>
                  <div className="book-meta">
                    <p>{item.issuer ? `Issued by ${item.issuer}.` : "Certification."}</p>
                    {item.url ? (
                      <div className="book-links">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn !min-h-9 !px-2.5 !text-[0.74rem]">
                          Verify ↗
                        </a>
                      </div>
                    ) : (
                      <span className="book-status">{item.year ? `Earned ${item.year}` : "Earned"}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Education as interview-style rows */}
      {education.length > 0 ? (
        <section className="bp-section">
          <div className="shell">
            <h2 className="stat-title !mb-2">06 · Education</h2>
            <ul className="iv-list">
              {education.map((item, i) => (
                <li key={item.id} className="iv-row !grid-cols-[40px_1fr_auto]">
                  <span className="iv-row-num">{pad2(i + 1)}</span>
                  <span>
                    <span className="iv-row-title block">{item.institution}</span>
                    <span className="block text-[0.95rem] text-ink-dim">
                      {[item.degree, item.field].filter(Boolean).join(", ")}
                      {item.notes ? ` — ${item.notes}` : ""}
                    </span>
                  </span>
                  <span className="iv-level">{[item.start_year, item.end_year].filter(Boolean).join("–") || "—"}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
