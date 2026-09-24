import { House, PencilSimpleLine, UsersThree, Tag, Briefcase } from "@phosphor-icons/react/ssr"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Gallery,
  GalleryHeader,
  GalleryMasonry,
  GalleryItem,
  GalleryImage,
} from "@/components/ui/gallery"
import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
} from "@/components/ui/section-header"
import { Lightbox, LightboxTrigger, type LightboxImage } from "@/components/ui/lightbox"

/**
 * gallery-section-1: the concepts wall.
 *
 * A centered lede, a tab rail that switches category, and a fake-masonry of framed previews that
 * every tile opens full-screen. The masonry is plain CSS columns, not a JS layout: the tiles carry
 * the aspect ratios, so the wall staggers without measuring anything.
 *
 * The Gallery is its own full-bleed band: it brings the centered gutter for the lede and the wide
 * bleed for the wall, so drop it straight onto the page. Do NOT wrap it in a Section or
 * SectionContainer or it will be padded twice.
 *
 * Two columns on a phone, three from sm, four from lg. The tab rail stays a single row and scrolls
 * sideways under an edge fade once the tabs outgrow the frame, instead of wrapping.
 */

// Remote crops off the Unsplash CDN, so the section renders the moment it lands in your project
// with no assets to copy. Swap the ids for your own work.
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`

const TABS = [
  {
    value: "home",
    label: "Home",
    icon: <House weight="bold" />,
    previews: [
      { src: img("1486312338219-ce68d2c6f44d"), alt: "Landing page concept on a laptop" },
      { src: img("1498050108023-c5249f4df085"), alt: "Code-forward product homepage" },
      { src: img("1467232004584-a241de8bcf5d"), alt: "Minimal hero layout workspace" },
      { src: img("1499951360447-b19be8fe80f5"), alt: "Bright marketing homepage mockup" },
      { src: img("1517694712202-14dd9538aa97"), alt: "Product homepage on a laptop screen" },
      { src: img("1504384308090-c894fdcc538d"), alt: "Designer workspace with a homepage draft" },
      { src: img("1488590528505-98d2b5aba04b"), alt: "Laptop showing a landing page" },
      { src: img("1461749280684-dccba630e2f6"), alt: "Homepage layout in a code editor" },
      { src: img("1497215728101-856f4ea42174"), alt: "Laptop and notebook on a desk" },
      { src: img("1519222970733-f546218fa6d7"), alt: "Bright workspace with a laptop" },
      { src: img("1486946255434-2466348c2166"), alt: "Laptop on a wooden desk" },
      { src: img("1517502884422-41eaead166d4"), alt: "Designer reviewing a layout" },
    ],
  },
  {
    value: "blog",
    label: "Blog article",
    icon: <PencilSimpleLine weight="bold" />,
    previews: [
      { src: img("1455390582262-044cdead277a"), alt: "Long-form article writing setup" },
      { src: img("1481277542470-605612bd2d61"), alt: "Editorial reading layout" },
      { src: img("1503676260728-1c00da094a0b"), alt: "Focused writing desk" },
      { src: img("1432888622747-4eb9a8efeb07"), alt: "Blog draft on a laptop" },
      { src: img("1483058712412-4245e9b90334"), alt: "Open notebook beside a laptop" },
      { src: img("1486406146926-c627a92ad1ab"), alt: "Writer's desk with a coffee" },
      { src: img("1499750310107-5fef28a66643"), alt: "Notebook and pen for drafting" },
      { src: img("1531297484001-80022131f5a1"), alt: "Minimal writing workspace" },
      { src: img("1542652694-40abf526446e"), alt: "Reading and note-taking setup" },
      { src: img("1521898284481-a5ec348cb555"), alt: "Coffee and a notebook for writing" },
      { src: img("1542222024-c39e2281f121"), alt: "Quiet desk for drafting articles" },
      { src: img("1556745753-b2904692b3cd"), alt: "Laptop open to a writing app" },
    ],
  },
  {
    value: "about",
    label: "About",
    icon: <UsersThree weight="bold" />,
    previews: [
      { src: img("1522202176988-66273c2fd55f"), alt: "Team collaborating in an office" },
      { src: img("1556761175-5973dc0f32e7"), alt: "Company team portrait" },
      { src: img("1551434678-e076c223a692"), alt: "Founders working together" },
      { src: img("1531403009284-440f080d1e12"), alt: "Modern studio workspace" },
      { src: img("1497366216548-37526070297c"), alt: "Team meeting around a table" },
      { src: img("1517077304055-6e89abbf09b0"), alt: "Colleagues collaborating at a desk" },
      { src: img("1522071820081-009f0129c71c"), alt: "Team brainstorming session" },
      { src: img("1600880292203-757bb62b4baf"), alt: "Coworkers reviewing work together" },
      { src: img("1556157382-97eda2d62296"), alt: "Team working together at a table" },
      { src: img("1524758631624-e2822e304c36"), alt: "Coworkers in a bright office" },
      { src: img("1559136555-9303baea8ebd"), alt: "Open office with the team" },
      { src: img("1531973576160-7125cd663d86"), alt: "Colleagues collaborating" },
    ],
  },
  {
    value: "pricing",
    label: "Pricing",
    icon: <Tag weight="bold" />,
    previews: [
      { src: img("1460925895917-afdab827c52f"), alt: "Analytics dashboard layout" },
      { src: img("1454165804606-c3d57bc86b40"), alt: "Plan comparison metrics" },
      { src: img("1543286386-713bdd548da4"), alt: "Revenue charts mockup" },
      { src: img("1579621970563-ebec7560ff3e"), alt: "Pricing tier graphs" },
      { src: img("1542751371-adc38448a05e"), alt: "Dashboard metrics on a screen" },
      { src: img("1542435503-956c469947f6"), alt: "Plan comparison on a laptop" },
      { src: img("1573164713988-8665fc963095"), alt: "Business charts on a monitor" },
      { src: img("1521737604893-d14cc237f11d"), alt: "Reviewing revenue metrics together" },
      { src: img("1593720213428-28a5b9e94613"), alt: "Charts and metrics on a screen" },
      { src: img("1542744094-3a31f272c490"), alt: "Analytics review on a laptop" },
      { src: img("1497032205916-ac775f0649ae"), alt: "Reporting dashboard at a desk" },
      { src: img("1517502166878-35c93a0072f0"), alt: "Business planning with charts" },
    ],
  },
  {
    value: "careers",
    label: "Careers",
    icon: <Briefcase weight="bold" />,
    previews: [
      { src: img("1497032628192-86f99bcd76bc"), alt: "Open office careers page" },
      { src: img("1517245386807-bb43f82c33c4"), alt: "Hiring desk setup" },
      { src: img("1519389950473-47ba0277781c"), alt: "Team working at their laptops" },
      { src: img("1542744173-8e7e53415bb0"), alt: "Whiteboard planning session" },
      { src: img("1515378791036-0648a3ef77b2"), alt: "Developer focused at a desk" },
      { src: img("1521791136064-7986c2920216"), alt: "Team collaborating in the office" },
      { src: img("1552664730-d307ca884978"), alt: "Whiteboard planning with the team" },
      { src: img("1531482615713-2afd69097998"), alt: "Open-plan office workspace" },
      { src: img("1498409785966-ab341407de6e"), alt: "Office hallway and workspace" },
      { src: img("1434030216411-0b793f4b4173"), alt: "Designer working on a laptop" },
      { src: img("1521737711867-e3b97375f902"), alt: "Team member at a standing desk" },
      { src: img("1556761175-4b46a572b786"), alt: "Hiring conversation in the office" },
    ],
  },
]

// Deliberately varied crop ratios, cycled by tile index, so the fake-masonry actually staggers.
// The source photos all sit near the same landscape ratio, so left to their natural heights the
// wall reads as a plain grid with a lone tall outlier. Forcing a mix of portrait / square /
// landscape aspects (the image is `w-full object-cover`, so it crops to fit) breaks the rows so
// neighbouring columns never line up. The strings are literal (not interpolated) so Tailwind's JIT
// generates each `aspect-[…]` utility, and the cycle is 12 long: one full pass per tab's 12 tiles.
const TILE_ASPECTS = [
  "aspect-[4/5]", // portrait
  "aspect-[3/2]", // wide
  "aspect-square", // square
  "aspect-[3/4]", // tall
  "aspect-[5/4]", // landscape
  "aspect-[5/6]", // soft portrait
  "aspect-[4/3]", // landscape
  "aspect-[2/3]", // tall statement (only one, so a single column gets the dramatic frame)
  "aspect-square", // square
  "aspect-[4/5]", // portrait
  "aspect-[4/3]", // landscape
  "aspect-[5/6]", // soft portrait
]

export function GallerySection1() {
  return (
    <Gallery className="rounded-lg">
      <Tabs defaultValue="home">
        <GalleryHeader>
          {/* The lede is the canonical SectionHeader (every marketing section leads with one);
              GalleryHeader stays only as the band's centered gutter + tab-rail home. */}
          <SectionHeader align="center">
            <SectionHeaderText>
              <SectionHeaderHeading>
                Create Multiple Concepts in a Matter of Seconds
              </SectionHeaderHeading>
              <SectionHeaderDescription>
                Cover virtually any marketing project with our pre-designed sections and templates
                for marketing landing page design.
              </SectionHeaderDescription>
            </SectionHeaderText>
          </SectionHeader>
          {/* Tabs default to `self-start` (left) inside the centered GalleryHeader column; `mx-auto`
              re-centers the rail under the lede, and `w-fit` keeps it shrink-to-content so it stays
              centered when it fits and fills + scrolls as a single row (with the edge fade) once the
              tabs outgrow the frame, instead of wrapping to a second row. */}
          <TabsList className="mt-5 mx-auto flex w-fit gap-1.5">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </GalleryHeader>

        {TABS.map((tab) => {
          const images: LightboxImage[] = tab.previews.map((p) => ({
            src: p.src,
            alt: p.alt,
          }))
          return (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:animate-in data-[state=active]:fade-in-0"
            >
              <Lightbox images={images}>
                <GalleryMasonry>
                  {tab.previews.map((preview, i) => (
                    <LightboxTrigger key={preview.src} index={i} asChild>
                      <GalleryItem action="See image">
                        <GalleryImage
                          src={preview.src}
                          alt={preview.alt}
                          className={TILE_ASPECTS[i % TILE_ASPECTS.length]}
                        />
                      </GalleryItem>
                    </LightboxTrigger>
                  ))}
                </GalleryMasonry>
              </Lightbox>
            </TabsContent>
          )
        })}
      </Tabs>
    </Gallery>
  )
}
