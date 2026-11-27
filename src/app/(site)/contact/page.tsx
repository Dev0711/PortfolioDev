import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { CopyChip } from "@/components/site/copy-chip";
import { LocalClock } from "@/components/site/local-clock";
import { PageHero } from "@/components/site/page-hero";
import { getProfile } from "@/lib/content/queries";
import { isExternal } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about backend, platform and AI engineering work.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const profile = await getProfile();

  const channels = [
    ...(profile.email ? [{ label: "Email", value: profile.email, url: `mailto:${profile.email}` }] : []),
    ...profile.socials.map((social) => ({
      label: social.label,
      value: social.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
      url: social.url,
    })),
    ...(profile.resume_url ? [{ label: "Résumé", value: "Download PDF", url: profile.resume_url }] : []),
  ];

  return (
    <>
      <PageHero index="03" eyebrow="Contact" heading="Let's *talk.*" body={profile.contact_intro} />

      <section className="bp-section">
        <div className="shell grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
          <div>
            <p className="eyebrow mb-4">Direct</p>
            {channels.length > 0 ? (
              <nav className="social-list" aria-label="Contact channels">
                {channels.map((channel) => (
                  <a
                    key={channel.label + channel.url}
                    href={channel.url}
                    className="social-row !grid-cols-[5rem_minmax(0,1fr)]"
                    {...(isExternal(channel.url) && !channel.url.startsWith("mailto:")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    <span className="social-label">{channel.label}</span>
                    <span className="social-handle truncate">{channel.value}</span>
                  </a>
                ))}
              </nav>
            ) : null}

            {profile.email ? (
              <div className="colophon-cmd">
                <code>{profile.email}</code>
                <CopyChip value={profile.email} label="Copy email address" />
              </div>
            ) : null}

            <dl className="lesson-meta !mt-6">
              {profile.location ? (
                <div>
                  <dt>Based in</dt>
                  <dd>{profile.location}</dd>
                </div>
              ) : null}
              <div>
                <dt>Local time</dt>
                <dd>
                  <LocalClock timezone={profile.timezone} />
                </dd>
              </div>
            </dl>
          </div>

          <div className="quiz !mt-0">
            <span className="quiz-stage">Send a message</span>
            <h2>Write to me</h2>
            <p className="quiz-intro">I read every message and reply within a couple of days.</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
