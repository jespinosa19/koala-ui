import { GithubLogo, InstagramLogo, LinkedinLogo, XLogo, YoutubeLogo } from "@phosphor-icons/react/ssr"

import {
  Footer,
  FooterBottom,
  FooterBrand,
  FooterColumn,
  FooterColumns,
  FooterCopyright,
  FooterLegal,
  FooterLink,
  FooterSocial,
  FooterSocialLink,
  FooterTagline,
  FooterTop,
} from "@/components/ui/footer"
import { KOALA_LOGO_SRC } from "@/lib/koala-mark"

/**
 * footer-section-1: the canonical marketing footer.
 *
 * A brand column (logo, one line of positioning, the social row) beside four link columns, then a
 * legal bar under a hairline. No filled panel: the footer sits on the page ground and the rule is
 * what closes the page. The columns fold to two, then one, as the width drops.
 */

const COLUMNS = [
  { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
  { title: "Resources", links: ["Docs", "Help center", "Community", "Status"] },
  { title: "Legal", links: ["Privacy", "Terms", "License", "Security"] },
]

const SOCIAL = [
  { label: "X", icon: XLogo },
  { label: "Instagram", icon: InstagramLogo },
  { label: "LinkedIn", icon: LinkedinLogo },
  { label: "GitHub", icon: GithubLogo },
  { label: "YouTube", icon: YoutubeLogo },
]

/** Your logo. Replace the mark and the name with your own. */
function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- packaged file: the embedded mark (a data URI), so no BrandMark and no next/image */}
      <img src={KOALA_LOGO_SRC} alt="" className="size-7 rounded-lg shadow-xs" />
      <span className="text-base font-semibold tracking-tight">Koala UI</span>
    </span>
  )
}

export function FooterSection1() {
  return (
    <Footer>
      <FooterTop>
        <FooterBrand>
          <Logo />
          <FooterTagline>Tools for teams that ship polished products, fast.</FooterTagline>
          <FooterSocial>
            {SOCIAL.map(({ label, icon: Icon }) => (
              <FooterSocialLink key={label} href="#" aria-label={label}>
                <Icon weight="bold" />
              </FooterSocialLink>
            ))}
          </FooterSocial>
        </FooterBrand>
        <FooterColumns>
          {COLUMNS.map((column) => (
            <FooterColumn key={column.title} title={column.title}>
              {column.links.map((label) => (
                <FooterLink key={label} href="#">
                  {label}
                </FooterLink>
              ))}
            </FooterColumn>
          ))}
        </FooterColumns>
      </FooterTop>
      <FooterBottom>
        <FooterCopyright>© 2026 Koala UI. All rights reserved.</FooterCopyright>
        <FooterLegal>
          <FooterLink href="#">Privacy</FooterLink>
          <FooterLink href="#">Terms</FooterLink>
          <FooterLink href="#">Cookies</FooterLink>
        </FooterLegal>
      </FooterBottom>
    </Footer>
  )
}
