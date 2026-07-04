import Link from "next/link"
import { GithubLogo, XLogo, DiscordLogo } from "@phosphor-icons/react/ssr"

import {
  Footer,
  FooterTop,
  FooterBrand,
  FooterTagline,
  FooterColumns,
  FooterColumn,
  FooterLink,
  FooterSocial,
  FooterSocialLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from "@/components/ui/footer"
import { BrandMark } from "@/components/landing/brand-mark"
import { FOOTER_COLUMNS } from "@/components/landing/data"

const LEGAL_LINKS = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "License", href: "#" },
  { label: "Refunds", href: "#" },
]

/** Site footer: brand column, grouped links, social icons, and the legal bar. */
export function LandingFooter() {
  return (
    <Footer variant="muted">
      <FooterTop>
        <FooterBrand>
          <BrandMark />
          <FooterTagline>
            A commercial React component library and design system. Pay once, build forever.
          </FooterTagline>
          <FooterSocial>
            <FooterSocialLink asChild aria-label="GitHub">
              <Link href="#">
                <GithubLogo weight="bold" />
              </Link>
            </FooterSocialLink>
            <FooterSocialLink asChild aria-label="X">
              <Link href="#">
                <XLogo weight="bold" />
              </Link>
            </FooterSocialLink>
            <FooterSocialLink asChild aria-label="Discord">
              <Link href="#">
                <DiscordLogo weight="bold" />
              </Link>
            </FooterSocialLink>
          </FooterSocial>
        </FooterBrand>

        <FooterColumns>
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} title={column.title}>
              {column.links.map((link) => (
                <FooterLink key={link.label} asChild>
                  <Link href={link.href}>{link.label}</Link>
                </FooterLink>
              ))}
            </FooterColumn>
          ))}
        </FooterColumns>
      </FooterTop>

      <FooterBottom>
        <FooterCopyright>© 2026 Koala UI. All rights reserved.</FooterCopyright>
        <FooterLegal>
          {LEGAL_LINKS.map((link) => (
            <FooterLink key={link.label} asChild>
              <Link href={link.href}>{link.label}</Link>
            </FooterLink>
          ))}
        </FooterLegal>
      </FooterBottom>
    </Footer>
  )
}
