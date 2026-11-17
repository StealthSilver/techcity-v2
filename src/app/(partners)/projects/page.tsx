import type { Metadata } from "next";
import { GlobeSection, ProjectsHero, StatusTiles, byStatus, cityCount, trackCount } from "@/components/projects-page";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Every TechCity campus program: what runs now, what starts next term and what we have delivered.",
};

/** All campus projects: the board, the numbers, the globe, and a door to each status. */
export default function Page() {
  return (
    <main>
      <ProjectsHero
        lead="Learning in action on campuses across India."
        rest="Every program we run, from next term back to the first batch."
        body="Industry trainers inside the timetable, labs every week and placement preparation that runs all term. Here is where it is happening now, what starts next and what we have delivered."
        stats={[
          { value: String(projects.length), label: "Campus projects" },
          { value: String(cityCount(projects)), label: "Cities" },
          { value: String(trackCount(projects)), label: "Tracks taught" },
          { value: String(byStatus("ongoing").length), label: "Running right now" },
        ]}
      />
      <GlobeSection lead="Where we teach." rest="Pick a status, then hover a project to find its campus." />
      <StatusTiles lead="Browse by status." rest="Each page has its campuses, tracks and dates." />
      {/* Lines end here: a full-width rule over the last section's bottom line. */}
      <div aria-hidden="true" className="relative -mt-px border-t border-line" />
    </main>
  );
}
