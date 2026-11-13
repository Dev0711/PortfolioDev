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

      <section className="shell section grid gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Reveal>
            <p className="label mb-8">Direct</p>
          </Reveal>
          <Stagger as="ul" className="border-t border-line">
            {channels.map((channel) => (
              <StaggerItem as="li" key={channel.label + channel.url} className="border-b border-line">
                <a
                  href={channel.url}
                  className="group flex items-center justify-between gap-6 py-6"
                  {...(isExternal(channel.url) && !channel.url.startsWith("mailto:")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <span className="min-w-0">
                    <span className="label mb-2 block">{channel.label}</span>
                    <span className="block truncate text-xl tracking-tight transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5 md:text-2xl">
                      {channel.value}
                    </span>
                  </span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-strong transition-colors duration-500 group-hover:border-signal group-hover:bg-signal group-hover:text-background">
                    <channel.icon className="size-4" aria-hidden />
                  </span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.2} className="label mt-8 space-y-2">
            {profile.location ? <p>Based in {profile.location}</p> : null}
            <p>
              Local time <LocalClock timezone={profile.timezone} />
            </p>
          </Reveal>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="label mb-8">Send a message</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
