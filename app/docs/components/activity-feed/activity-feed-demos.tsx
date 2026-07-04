"use client"

import * as React from "react"
import {
  ChatCircle,
  At,
  UploadSimple,
  CheckCircle,
  Heart,
  UserPlus,
  GitMerge,
  PencilSimple,
  DownloadSimple,
} from "@phosphor-icons/react"

import {
  ActivityFeed,
  ActivityItem,
  ActivityMarker,
  ActivityIcon,
  ActivityDot,
  ActivityContent,
  ActivityHeader,
  ActivityActor,
  ActivityTime,
  ActivityBody,
  ActivityCard,
  ActivityAttachments,
  ActivityImage,
} from "@/components/ui/activity-feed"
import {
  FileCard,
  FileCardIcon,
  FileCardContent,
  FileCardName,
  FileCardMeta,
} from "@/components/ui/file-card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

/* ----------------------------------------------------------------- showcase --- */

export function ShowcaseDemo() {
  return (
    <div className="w-full max-w-lg">
      <ActivityFeed>
        {/* A posted comment: avatar marker, quoted in a card. */}
        <ActivityItem>
          <ActivityMarker>
            <Avatar size="sm">
              <AvatarImage src="https://i.pravatar.cc/64?img=47" alt="Sarah Chen" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Sarah Chen</ActivityActor>
              commented
              <ActivityTime dateTime="2026-06-15T12:30:00Z">2h ago</ActivityTime>
            </ActivityHeader>
            <ActivityCard>
              Love the new onboarding flow. The empty states make a huge difference. Can we
              ship the copy tweaks before Friday?
            </ActivityCard>
          </ActivityContent>
        </ActivityItem>

        {/* A mention: tinted icon marker. */}
        <ActivityItem>
          <ActivityMarker>
            <ActivityIcon tone="purple">
              <At weight="bold" />
            </ActivityIcon>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Marcus Lee</ActivityActor>
              mentioned you in <ActivityActor asChild><a href="#">Q3 roadmap</a></ActivityActor>
              <ActivityTime dateTime="2026-06-15T11:05:00Z">3h ago</ActivityTime>
            </ActivityHeader>
            <ActivityBody>“@you can you own the migration checklist for this one?”</ActivityBody>
          </ActivityContent>
        </ActivityItem>

        {/* An upload: image gallery + a reused FileCard row. */}
        <ActivityItem>
          <ActivityMarker>
            <ActivityIcon tone="teal">
              <UploadSimple weight="bold" />
            </ActivityIcon>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Priya Nair</ActivityActor>
              uploaded 2 files
              <ActivityTime dateTime="2026-06-15T09:48:00Z">5h ago</ActivityTime>
            </ActivityHeader>
            <ActivityAttachments>
              <div className="flex flex-wrap gap-2">
                <ActivityImage
                  src="https://images.unsplash.com/photo-1557683316-973673baf926?w=160&q=80"
                  alt="Brand gradient exploration"
                />
              </div>
              <FileCard variant="ghost">
                <FileCardIcon type="pdf" />
                <FileCardContent>
                  <FileCardName>Brand-guidelines.pdf</FileCardName>
                  <FileCardMeta>2.4 MB · PDF document</FileCardMeta>
                </FileCardContent>
              </FileCard>
            </ActivityAttachments>
          </ActivityContent>
        </ActivityItem>

        {/* A status change: success icon + a Badge. */}
        <ActivityItem>
          <ActivityMarker>
            <ActivityIcon tone="success">
              <CheckCircle weight="bold" />
            </ActivityIcon>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Marcus Lee</ActivityActor>
              changed status to
              <Badge size="sm" variant="success">Done</Badge>
              <ActivityTime dateTime="2026-06-15T08:20:00Z">6h ago</ActivityTime>
            </ActivityHeader>
          </ActivityContent>
        </ActivityItem>

        {/* A reaction: pink icon. */}
        <ActivityItem>
          <ActivityMarker>
            <ActivityIcon tone="pink">
              <Heart weight="fill" />
            </ActivityIcon>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Sarah Chen</ActivityActor>
              reacted to your comment
              <ActivityTime dateTime="2026-06-14T18:00:00Z">Yesterday</ActivityTime>
            </ActivityHeader>
          </ActivityContent>
        </ActivityItem>

        {/* A minor edit: low-emphasis dot, the last item closes the rail. */}
        <ActivityItem>
          <ActivityMarker>
            <ActivityDot />
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Priya Nair</ActivityActor>
              changed the due date to <span className="text-foreground">Jun 20</span>
              <ActivityTime dateTime="2026-06-14T16:30:00Z">Yesterday</ActivityTime>
            </ActivityHeader>
          </ActivityContent>
        </ActivityItem>
      </ActivityFeed>
    </div>
  )
}

/* ------------------------------------------------------------------- simple --- */

export function SimpleDemo() {
  return (
    <div className="w-full max-w-md">
      <ActivityFeed>
        <ActivityItem>
          <ActivityMarker>
            <ActivityIcon tone="info">
              <ChatCircle weight="bold" />
            </ActivityIcon>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Alex Rivera</ActivityActor>
              opened the issue
              <ActivityTime dateTime="2026-06-15T10:00:00Z">1h ago</ActivityTime>
            </ActivityHeader>
          </ActivityContent>
        </ActivityItem>
        <ActivityItem>
          <ActivityMarker>
            <ActivityIcon tone="success">
              <GitMerge weight="bold" />
            </ActivityIcon>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Alex Rivera</ActivityActor>
              merged the pull request
              <ActivityTime dateTime="2026-06-15T10:30:00Z">30m ago</ActivityTime>
            </ActivityHeader>
          </ActivityContent>
        </ActivityItem>
      </ActivityFeed>
    </div>
  )
}

/* ------------------------------------------------------------------ markers --- */

export function MarkersDemo() {
  return (
    <div className="w-full max-w-md">
      <ActivityFeed>
        <ActivityItem>
          <ActivityMarker>
            <Avatar size="sm">
              <AvatarImage src="https://i.pravatar.cc/64?img=12" alt="June Park" />
              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>June Park</ActivityActor>
              joined the workspace
              <ActivityTime dateTime="2026-06-15T10:00:00Z">2m ago</ActivityTime>
            </ActivityHeader>
          </ActivityContent>
        </ActivityItem>
        <ActivityItem>
          <ActivityMarker>
            <ActivityIcon tone="orange">
              <UserPlus weight="bold" />
            </ActivityIcon>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>June Park</ActivityActor>
              was assigned to <span className="text-foreground">Billing v2</span>
              <ActivityTime dateTime="2026-06-15T09:55:00Z">7m ago</ActivityTime>
            </ActivityHeader>
          </ActivityContent>
        </ActivityItem>
        <ActivityItem>
          <ActivityMarker>
            <ActivityDot tone="default" />
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>June Park</ActivityActor>
              renamed the project
              <ActivityTime dateTime="2026-06-15T09:50:00Z">12m ago</ActivityTime>
            </ActivityHeader>
          </ActivityContent>
        </ActivityItem>
      </ActivityFeed>
    </div>
  )
}

/* -------------------------------------------------------------- attachments --- */

export function AttachmentsDemo() {
  return (
    <div className="w-full max-w-md">
      <ActivityFeed connector={false}>
        <ActivityItem>
          <ActivityMarker>
            <ActivityIcon tone="teal">
              <UploadSimple weight="bold" />
            </ActivityIcon>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Priya Nair</ActivityActor>
              attached 3 files
              <ActivityTime dateTime="2026-06-15T09:48:00Z">5h ago</ActivityTime>
            </ActivityHeader>
            <ActivityAttachments>
              <div className="flex flex-wrap gap-2">
                <ActivityImage
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&q=80"
                  alt="Poster concept"
                />
                <ActivityImage
                  src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=160&q=80"
                  alt="Color study"
                />
              </div>
              <FileCard variant="ghost">
                <FileCardIcon type="archive" />
                <FileCardContent>
                  <FileCardName>source-assets.zip</FileCardName>
                  <FileCardMeta>18 MB · Archive</FileCardMeta>
                </FileCardContent>
              </FileCard>
            </ActivityAttachments>
          </ActivityContent>
        </ActivityItem>
      </ActivityFeed>
    </div>
  )
}

/* ----------------------------------------------------------------- comment --- */

export function CommentDemo() {
  return (
    <div className="w-full max-w-md">
      <ActivityFeed connector={false}>
        <ActivityItem>
          <ActivityMarker>
            <Avatar size="sm">
              <AvatarImage src="https://i.pravatar.cc/64?img=32" alt="Dana Wu" />
              <AvatarFallback>DW</AvatarFallback>
            </Avatar>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Dana Wu</ActivityActor>
              left a review
              <ActivityTime dateTime="2026-06-15T07:10:00Z">8h ago</ActivityTime>
            </ActivityHeader>
            <ActivityCard>
              The motion polish is great, but the empty-state illustration feels a touch heavy
              against the cream theme. Maybe drop it to 80% opacity?
            </ActivityCard>
          </ActivityContent>
        </ActivityItem>
      </ActivityFeed>
    </div>
  )
}

/* ----------------------------------------------------------------- density --- */

function DensitySample({ density }: { density: "comfortable" | "compact" }) {
  return (
    <ActivityFeed density={density} className="w-full max-w-xs">
      <ActivityItem>
        <ActivityMarker>
          <ActivityIcon tone="info">
            <PencilSimple weight="bold" />
          </ActivityIcon>
        </ActivityMarker>
        <ActivityContent>
          <ActivityHeader>
            <ActivityActor>Alex</ActivityActor>edited the brief
            <ActivityTime dateTime="2026-06-15T10:00:00Z">1h</ActivityTime>
          </ActivityHeader>
        </ActivityContent>
      </ActivityItem>
      <ActivityItem>
        <ActivityMarker>
          <ActivityIcon tone="success">
            <DownloadSimple weight="bold" />
          </ActivityIcon>
        </ActivityMarker>
        <ActivityContent>
          <ActivityHeader>
            <ActivityActor>Alex</ActivityActor>exported the report
            <ActivityTime dateTime="2026-06-15T10:05:00Z">55m</ActivityTime>
          </ActivityHeader>
        </ActivityContent>
      </ActivityItem>
    </ActivityFeed>
  )
}

export function DensityDemo() {
  return (
    <div className="flex flex-wrap items-start gap-10">
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">comfortable</p>
        <DensitySample density="comfortable" />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">compact</p>
        <DensitySample density="compact" />
      </div>
    </div>
  )
}
