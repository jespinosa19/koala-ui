import Link from "next/link"
import { Megaphone } from "@phosphor-icons/react/ssr"

import { Banner, BannerIcon, BannerContent, BannerAction } from "@/components/ui/banner"
import { ANNOUNCEMENT } from "@/components/landing/data"

/** Full-bleed announcement banner above the navbar (scrolls away; the navbar stays sticky). */
export function AnnouncementBar() {
  return (
    <Banner variant="purple">
      <BannerIcon>
        <Megaphone weight="bold" />
      </BannerIcon>
      <BannerContent>{ANNOUNCEMENT.text}</BannerContent>
      <BannerAction asChild>
        <Link href={ANNOUNCEMENT.href}>{ANNOUNCEMENT.linkLabel}</Link>
      </BannerAction>
    </Banner>
  )
}
