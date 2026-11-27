import { ArrowUpRight, Download, Mail } from "lucide-react";
import type { Metadata } from "next";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ContactForm } from "@/components/site/contact-form";
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
    ...(profile.email ? [{ label: "Email", value: profile.email, url: `mailto:${profile.email}`, icon: Mail }] : []),
    ...profile.socials.map((social) => ({
      label: social.label,
      value: social.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
      url: social.url,
      icon: ArrowUpRight,
    })),
    ...(profile.resume_url
      ? [{ label: "Résumé", value: "Download PDF", url: profile.resume_url, icon: Download }]
      : []),
  ];

  return (
    <>
      <PageHero index="03" eyebrow="Contact" heading="Let's *talk.*" body={profile.contact_intro} seed={53} />

      <section className="shell section grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Reveal>
            <p className="eyebrow mb-4">Direct</p>
          </Reveal>
          <Stagger as="ul" className="panel">
            {channels.map((channel) => (
              <StaggerItem as="li" key={channel.label + channel.url} className="border-b border-line last:border-b-0">
                <a
                  href={channel.url}
                  className="group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--signal-tint)]"
                  {...(isExternal(channel.url) && !channel.url.startsWith("mailto:")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <span className="min-w-0">
                    <span className="label mb-1 block !text-ink-dim">{channel.label}</span>
                    <span className="block truncate text-[1.08rem] transition-colors group-hover:text-signal">
                      {channel.value}
                    </span>
                  </span>
                  <span className="icon-btn group-hover:border-signal group-hover:text-signal">
                    <channel.icon className="size-4" aria-hidden />
                  </span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.2} className="label mt-5 space-y-1.5">
            {profile.location ? <p>Based in {profile.location}</p> : null}
            <p>
              Local time <LocalClock timezone={profile.timezone} />
            </p>
          </Reveal>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="eyebrow mb-4">Send a message</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
