"use client"

import * as React from "react"
import { DotsThreeVertical, ChatCircle, Heart } from "@phosphor-icons/react"

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarStatus,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  List,
  ListItem,
  ListItemMedia,
  ListItemContent,
  ListItemTitle,
  ListItemDescription,
  ListItemMeta,
} from "@/components/ui/list"
import {
  ActivityFeed,
  ActivityItem,
  ActivityMarker,
  ActivityContent,
  ActivityHeader,
  ActivityActor,
  ActivityTime,
  ActivityBody,
} from "@/components/ui/activity-feed"

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

// - Profile card --------------------------------------------------------------

export function ProfileCardDemo() {
  return (
    <div className="flex w-64 flex-col items-center gap-4 text-center">
      <Avatar size="xl">
        <AvatarImage src="https://i.pravatar.cc/160?img=12" alt="Esteban Alonso" />
        <AvatarFallback>EA</AvatarFallback>
        <AvatarStatus variant="online" />
      </Avatar>
      <div className="space-y-1">
        <p className="font-semibold leading-none text-foreground">Esteban Alonso</p>
        <p className="text-sm text-muted-foreground">Product Designer</p>
      </div>
      <Badge variant="info" size="sm" dot>Admin</Badge>
      <div className="flex w-full gap-2">
        <Button size="sm" className="flex-1">Follow</Button>
        <Button size="sm" variant="outline" className="flex-1">Message</Button>
      </div>
    </div>
  )
}

// - Team member list ----------------------------------------------------------

const MEMBERS = [
  { img: 12, name: "Esteban Alonso", email: "esteban@koala.ui", role: "Admin"  as const, status: "online"  as const },
  { img: 5,  name: "Marie Dubois",   email: "marie@koala.ui",   role: "Editor" as const, status: "away"    as const },
  { img: 32, name: "Liam Chen",      email: "liam@koala.ui",    role: "Viewer" as const, status: "offline" as const },
]

// Role reads through the dot; the label stays foreground so the row scans cleanly.
const ROLE_VARIANT = {
  Admin:  "info",
  Editor: "success",
  Viewer: "default",
} as const

export function TeamListDemo() {
  return (
    <div className="w-80">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Team members</h3>
        <Button size="sm" variant="ghost" className="-mr-2">Invite</Button>
      </div>
      <List variant="plain" className="mt-2 border-t border-border">
        {MEMBERS.map((m) => (
          <ListItem key={m.name}>
            <ListItemMedia>
              <Avatar size="sm">
                <AvatarImage src={`https://i.pravatar.cc/160?img=${m.img}`} alt={m.name} />
                <AvatarFallback>{initials(m.name)}</AvatarFallback>
                <AvatarStatus variant={m.status} />
              </Avatar>
            </ListItemMedia>
            <ListItemContent>
              <ListItemTitle>{m.name}</ListItemTitle>
              <ListItemDescription>{m.email}</ListItemDescription>
            </ListItemContent>
            <ListItemMeta>
              <Badge variant={ROLE_VARIANT[m.role]} size="sm" dot>{m.role}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    iconOnly
                    aria-label={`Actions for ${m.name}`}
                    tooltip={false}
                  >
                    <DotsThreeVertical weight="bold" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View profile</DropdownMenuItem>
                  <DropdownMenuItem>Change role</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Remove member</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ListItemMeta>
          </ListItem>
        ))}
      </List>
    </div>
  )
}

// - Comment thread ------------------------------------------------------------

const COMMENTS = [
  {
    img: 12,
    name: "Esteban Alonso",
    time: "2m ago",
    dateTime: "2026-06-15T11:58:00Z",
    text: "The new token system is really clean. Switching themes feels instant now.",
  },
  {
    img: 5,
    name: "Marie Dubois",
    time: "1m ago",
    dateTime: "2026-06-15T11:59:00Z",
    text: "Agreed, and the shadow scale is exactly what the cards needed.",
  },
  {
    img: 32,
    name: "Liam Chen",
    time: "just now",
    dateTime: "2026-06-15T12:00:00Z",
    text: "Shipping this to staging today. Will update once QA signs off.",
  },
]

export function CommentThreadDemo() {
  return (
    <ActivityFeed className="w-80">
      {COMMENTS.map((c) => (
        <ActivityItem key={c.name}>
          <ActivityMarker>
            <Avatar size="sm">
              <AvatarImage src={`https://i.pravatar.cc/160?img=${c.img}`} alt={c.name} />
              <AvatarFallback>{initials(c.name)}</AvatarFallback>
            </Avatar>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>{c.name}</ActivityActor>
              <ActivityTime dateTime={c.dateTime}>{c.time}</ActivityTime>
            </ActivityHeader>
            <ActivityBody>{c.text}</ActivityBody>
            <div className="-ml-2.5 mt-1 flex gap-0.5">
              <Button variant="ghost" size="sm">
                <Heart weight="bold" />
                Like
              </Button>
              <Button variant="ghost" size="sm">
                <ChatCircle weight="bold" />
                Reply
              </Button>
            </div>
          </ActivityContent>
        </ActivityItem>
      ))}
    </ActivityFeed>
  )
}
