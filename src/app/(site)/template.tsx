import { PageTransition } from "@/components/site/page-transition";

/** A template re-mounts on every navigation, which replays the enter transition. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
