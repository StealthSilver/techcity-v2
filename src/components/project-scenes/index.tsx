"use client";

import type { ComponentType } from "react";
import type { ProjectStatus } from "@/lib/projects";
import BoardScene from "./board";
import CompletedScene from "./completed";
import OngoingScene from "./ongoing";
import UpcomingScene from "./upcoming";

/**
 * Hero pictures for the projects pages, built with the stageshow kit
 * (src/stageshow/kit) from the real project data: each plays once as it comes
 * into view and keeps its payoff on screen.
 *
 * - all: every project on one board; Faridabad finishes and moves to Completed.
 * - ongoing: a week at Faridabad; the labs finish and the week rolls on.
 * - upcoming: Gurugram's kickoff checklist; it turns Ready to start.
 * - completed: Gurugram's report; the assessment line draws, the average rolls.
 */
const scenes: Record<ProjectStatus | "all", ComponentType> = {
  all: BoardScene,
  ongoing: OngoingScene,
  upcoming: UpcomingScene,
  completed: CompletedScene,
};

export function ProjectScene({ id }: { id: ProjectStatus | "all" }) {
  const Scene = scenes[id];
  return (
    <div className="project-scene">
      <Scene />
    </div>
  );
}
