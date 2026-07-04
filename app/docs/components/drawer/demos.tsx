"use client"

import * as React from "react"
import {
  ArrowLineUp,
  ArrowLineRight,
  ArrowLineDown,
  ArrowLineLeft,
  Link as LinkIcon,
  Export,
  Copy,
  Star,
  TrashSimple,
  House,
  ChartBar,
  Users,
  Gear,
  CreditCard,
  Lifebuoy,
  CaretRight,
  ShareNetwork,
  BellSimple,
  Globe,
  Lock,
  UserCircle,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { InputLabel, InputRoot, InputField } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerNav,
  DrawerView,
  DrawerNavTrigger,
  DrawerNavBack,
  type DrawerSide,
} from "@/components/ui/drawer"

/** One trigger per edge: the same drawer recipe, four `side` values. */
export function DrawerSidesShowcase() {
  const sides: { side: DrawerSide; label: string; icon: React.ReactNode }[] = [
    { side: "top", label: "Top", icon: <ArrowLineUp weight="bold" /> },
    { side: "right", label: "Right", icon: <ArrowLineRight weight="bold" /> },
    { side: "bottom", label: "Bottom", icon: <ArrowLineDown weight="bold" /> },
    { side: "left", label: "Left", icon: <ArrowLineLeft weight="bold" /> },
  ]
  return (
    <div className="flex flex-wrap gap-3">
      {sides.map(({ side, label, icon }) => (
        <Drawer key={side}>
          <DrawerTrigger asChild>
            <Button variant="outline">
              {icon} {label}
            </Button>
          </DrawerTrigger>
          <DrawerContent side={side}>
            <DrawerHeader>
              <DrawerTitle>{label} drawer</DrawerTitle>
              <DrawerDescription>
                Slides in from the {label.toLowerCase()} edge. Drag the handle or header
                toward the edge to flick it closed.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <p className="text-sm text-muted-foreground">
                Side panels fill a phone screen and cap to a panel on desktop; top and
                bottom sheets cap their height and carry a grab handle.
              </p>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button>Done</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  )
}

/**
 * The native mobile pattern: a bottom sheet with a grab handle, rounded top, and
 * swipe-to-dismiss. Acts as an action sheet here.
 */
export function MobileSheetDemo() {
  const actions = [
    { icon: <Copy weight="bold" />, label: "Copy link" },
    { icon: <Export weight="bold" />, label: "Share to…" },
    { icon: <Star weight="bold" />, label: "Add to favorites" },
    { icon: <TrashSimple weight="bold" />, label: "Delete", destructive: true },
  ]
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <LinkIcon weight="bold" /> Open action sheet
        </Button>
      </DrawerTrigger>
      <DrawerContent side="bottom" showClose={false}>
        <DrawerHeader>
          <DrawerTitle>Project roadmap</DrawerTitle>
          <DrawerDescription>Choose an action for this document.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="pb-2">
          <div className="flex flex-col">
            {actions.map(({ icon, label, destructive }) => (
              <DrawerClose asChild key={label}>
                <button
                  type="button"
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors duration-fast ease-out hover:bg-accent active:scale-[0.99] [&_svg]:size-5 [&_svg]:shrink-0 ${
                    destructive ? "text-destructive hover:bg-destructive/10" : "text-foreground"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              </DrawerClose>
            ))}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

/** A right-side drawer carrying a form: the desktop "edit panel" pattern. */
export function DrawerFormDemo() {
  const nameRef = React.useRef<HTMLInputElement>(null)
  const [name, setName] = React.useState("Ada Lovelace")
  const [email, setEmail] = React.useState("ada@analytical.engine")

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Edit profile</Button>
      </DrawerTrigger>
      <DrawerContent
        side="right"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          nameRef.current?.focus()
        }}
      >
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Update your details. Changes are saved when you close the panel.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <InputLabel htmlFor="drawer-name">Full name</InputLabel>
              <InputRoot>
                <InputField
                  ref={nameRef}
                  id="drawer-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </InputRoot>
            </div>
            <div className="grid gap-1.5">
              <InputLabel htmlFor="drawer-email">Email address</InputLabel>
              <InputRoot>
                <InputField
                  id="drawer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputRoot>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button>Save changes</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

/** A left drawer as a mobile navigation menu: long, scrollable body. */
export function NavigationDrawerDemo() {
  const items = [
    { icon: <House weight="bold" />, label: "Dashboard" },
    { icon: <ChartBar weight="bold" />, label: "Analytics" },
    { icon: <Users weight="bold" />, label: "Team" },
    { icon: <CreditCard weight="bold" />, label: "Billing" },
    { icon: <Gear weight="bold" />, label: "Settings" },
    { icon: <Lifebuoy weight="bold" />, label: "Support" },
  ]
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open navigation</Button>
      </DrawerTrigger>
      <DrawerContent side="left" size="sm">
        <DrawerHeader>
          <DrawerTitle>Koala</DrawerTitle>
          <DrawerDescription>Workspace navigation</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <nav className="flex flex-col gap-1">
            {items.map(({ icon, label }) => (
              <DrawerClose asChild key={label}>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-fast ease-out hover:bg-accent hover:text-foreground [&_svg]:size-5 [&_svg]:shrink-0"
                >
                  {icon}
                  {label}
                </a>
              </DrawerClose>
            ))}
          </nav>
        </DrawerBody>
        <DrawerFooter className="sm:justify-start">
          <span className="text-xs text-muted-foreground">v2.4.0 · Signed in as Ada</span>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

/** A row that drills into a nested view, with a leading icon and a trailing chevron. */
function NavRow({ view, icon, label }: { view: string; icon: React.ReactNode; label: string }) {
  return (
    <DrawerNavTrigger view={view} asChild>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition-colors duration-fast ease-out hover:bg-accent active:scale-[0.99] [&_svg]:size-5 [&_svg]:shrink-0"
      >
        <span className="text-muted-foreground">{icon}</span>
        {label}
        <CaretRight weight="bold" className="ml-auto text-muted-foreground" />
      </button>
    </DrawerNavTrigger>
  )
}

/** A toggle row used inside the nested Notifications view. */
function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors duration-fast ease-out hover:bg-accent">
      {label}
      <Switch defaultChecked={defaultChecked} />
    </label>
  )
}

/** Shared header for a nested view: back button (auto-hidden at root) + the view's title. */
function ViewHeader({ title }: { title: string }) {
  return (
    <DrawerHeader className="flex-row items-center gap-1 pb-2">
      <DrawerNavBack className="-ml-1.5" />
      <DrawerTitle>{title}</DrawerTitle>
    </DrawerHeader>
  )
}

/**
 * Navigation *inside* the bottom sheet: a settings sheet that drills into nested views.
 * `DrawerNav` swaps `DrawerView` pages with a horizontal push and resizes the sheet to fit;
 * `DrawerNavBack` pops. Swipe-down still dismisses the whole sheet from any view.
 */
export function NestedSheetDemo() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Gear weight="bold" /> Settings
        </Button>
      </DrawerTrigger>
      <DrawerContent side="bottom" showClose={false}>
        <DrawerNav defaultView="root">
          <DrawerView view="root">
            <ViewHeader title="Settings" />
            <DrawerBody className="pb-2">
              <NavRow view="account" icon={<UserCircle weight="bold" />} label="Account" />
              <NavRow view="notifications" icon={<BellSimple weight="bold" />} label="Notifications" />
              <NavRow view="privacy" icon={<Lock weight="bold" />} label="Privacy & security" />
            </DrawerBody>
          </DrawerView>

          <DrawerView view="account">
            <ViewHeader title="Account" />
            <DrawerBody className="gap-4 pb-4">
              <div className="grid gap-1.5">
                <InputLabel htmlFor="nested-name">Display name</InputLabel>
                <InputRoot>
                  <InputField id="nested-name" defaultValue="Ada Lovelace" />
                </InputRoot>
              </div>
              <NavRow view="privacy" icon={<ShareNetwork weight="bold" />} label="Connected accounts" />
            </DrawerBody>
          </DrawerView>

          <DrawerView view="notifications">
            <ViewHeader title="Notifications" />
            <DrawerBody className="pb-2">
              <ToggleRow label="Push notifications" defaultChecked />
              <ToggleRow label="Email digest" />
              <ToggleRow label="Mentions only" defaultChecked />
            </DrawerBody>
          </DrawerView>

          <DrawerView view="privacy">
            <ViewHeader title="Privacy & security" />
            <DrawerBody className="pb-2">
              <ToggleRow label="Private profile" defaultChecked />
              <NavRow view="region" icon={<Globe weight="bold" />} label="Region & language" />
            </DrawerBody>
          </DrawerView>

          <DrawerView view="region">
            <ViewHeader title="Region & language" />
            <DrawerBody className="pb-4">
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Two levels deep. Back returns to Privacy, then to Settings. The sheet height
                animates to each view.
              </p>
            </DrawerBody>
          </DrawerView>
        </DrawerNav>
      </DrawerContent>
    </Drawer>
  )
}
