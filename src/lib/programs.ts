import type { IconName } from "@/components/icons";

export const partnerPrograms = [
  {
    title: "For students",
    items: [
      { anchor: "trainers", label: "Trainers for students", description: "30+ subjects on campus", icon: "trainer" },
      { anchor: "placement", label: "Placement preparation", description: "Interviews and drills", icon: "target" },
      { anchor: "placing", label: "Student placement", description: "Campus to first role", icon: "briefcase" },
      { anchor: "mentorship", label: "Mentorship", description: "Industry mentors", icon: "compass" },
    ],
  },
  {
    title: "For colleges",
    items: [
      { anchor: "faculty", label: "Faculty development", description: "Upskill your faculty", icon: "faculty" },
      { anchor: "online", label: "Online lessons", description: "Live virtual classes", icon: "video" },
      { anchor: "content", label: "Online content", description: "Videos, notes and tests", icon: "content" },
      { anchor: "platforms", label: "Platforms for colleges", description: "LMS, ERP and more", icon: "platform" },
    ],
  },
] satisfies { title: string; items: { anchor: string; label: string; description: string; icon: IconName }[] }[];

/**
 * Homepage bento: all eight programs, in reading order. `size` sets the card's
 * footprint on the desktop grid (3 columns, 4 rows):
 *
 *   trainers   trainers   placement
 *   placing    mentor     placement
 *   faculty    online     online
 *   faculty    content    platforms
 */
export type BentoSize = "wide" | "tall" | "small";

export const programBento = [
  { anchor: "trainers", title: "Bring industry trainers to campus, across 30+ subjects", size: "wide" },
  { anchor: "placement", title: "Prepare every student for interviews", size: "tall" },
  { anchor: "placing", title: "Place students in their first role", size: "small" },
  { anchor: "mentorship", title: "Pair students with industry mentors", size: "small" },
  { anchor: "faculty", title: "Keep faculty current with the latest in tech", size: "tall" },
  { anchor: "online", title: "Run live classes online, on any schedule", size: "wide" },
  { anchor: "content", title: "Ready-made videos, notes and tests", size: "small" },
  { anchor: "platforms", title: "Run your college on one platform", size: "small" },
] satisfies { anchor: string; title: string; size: BentoSize }[];
