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
      <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-foreground text-background">
        <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
          <path d="M8 1.5 14.5 14h-13Z" />
        </svg>
      </span>
      <span className="text-base font-semibold tracking-tight">Acme</span>
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
        <FooterCopyright>© 2026 Acme, Inc. All rights reserved.</FooterCopyright>
        <FooterLegal>
          <FooterLink href="#">Privacy</FooterLink>
          <FooterLink href="#">Terms</FooterLink>
          <FooterLink href="#">Cookies</FooterLink>
        </FooterLegal>
      </FooterBottom>
    </Footer>
  )
}
