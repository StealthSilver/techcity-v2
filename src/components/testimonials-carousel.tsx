"use client";

import Link from "next/link";
import { useState } from "react";
import { HoverArrow } from "@/components/hover-arrow";

const testimonials = [
  {
    name: "Partner voice 01",
    role: "Academic leader · Placeholder institution",
    quote:
      "The program helped our students connect classroom concepts with the skills and confidence they need for their next step.",
    tone: "lavender",
    category: "Student outcomes",
  },
  {
    name: "Partner voice 02",
    role: "Faculty member · Placeholder institution",
    quote:
      "Our faculty found a practical way to bring current industry perspectives into the learning experience.",
    tone: "amber",
    category: "Faculty development",
  },
  {
    name: "Partner voice 03",
    role: "Placement lead · Placeholder institution",
    quote:
      "Students had more opportunities to practise, get feedback and approach placement conversations with confidence.",
    tone: "blue",
    category: "Career readiness",
  },
  {
    name: "Partner voice 04",
    role: "Program coordinator · Placeholder institution",
    quote:
      "The learning journey gave students a clear structure, from exploring a subject to applying what they learned.",
    tone: "cream",
    category: "Learning journeys",
  },
  {
    name: "Partner voice 05",
    role: "Department head · Placeholder institution",
    quote:
      "A thoughtful partnership made it easier to create experiences that feel relevant to both students and educators.",
    tone: "indigo",
    category: "Campus partnership",
  },
  {
    name: "Partner voice 06",
    role: "Student mentor · Placeholder institution",
    quote:
      "Regular practice and approachable mentorship helped learners keep making progress, one milestone at a time.",
    tone: "honey",
    category: "Mentorship",
  },
  {
    name: "Partner voice 07",
    role: "Dean · Placeholder institution",
    quote:
      "The collaboration brought a fresh perspective to how we prepare students for a changing world of work.",
    tone: "mist",
    category: "Industry alignment",
  },
  {
    name: "Partner voice 08",
    role: "Training partner · Placeholder institution",
    quote:
      "It has been rewarding to see students learn together, share ideas and turn new skills into real projects.",
    tone: "peach",
    category: "Project learning",
  },
] as const;

function ArrowButton({ direction, onClick }: { direction: "previous" | "next"; onClick: () => void }) {
  const isPrevious = direction === "previous";

  return (
    <button
      type="button"
      className="testimonial-arrow"
      aria-label={isPrevious ? "Show previous testimonial" : "Show next testimonial"}
      onClick={onClick}
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        {isPrevious ? (
          <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H16" />
        ) : (
          <path d="m7.5 4.5 5.5 5.5-5.5 5.5M12.5 10H4" />
        )}
      </svg>
    </button>
  );
}

export function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleTestimonials = testimonials.map((_, offset) => testimonials[(activeIndex + offset) % testimonials.length]);

  function move(direction: -1 | 1) {
    setActiveIndex((current) => (current + direction + testimonials.length) % testimonials.length);
  }

  return (
    <div className="testimonials-carousel">
      <div className="testimonials-carousel__header">
        <div>
          <p className="text-[13px] font-medium tracking-[0.08em] text-text-muted uppercase">Testimonials</p>
          <h2 className="mt-3 text-[clamp(28px,3.8vw,40px)] leading-[1.15] font-normal tracking-[-0.03em] text-text">
            Stories from our partners
          </h2>
          <p className="mt-3 text-[16px] text-text-muted">Hear what learning communities are saying.</p>
        </div>
        <div className="testimonials-carousel__controls">
          <ArrowButton direction="previous" onClick={() => move(-1)} />
          <ArrowButton direction="next" onClick={() => move(1)} />
        </div>
      </div>

      <div className="testimonial-gallery" aria-label="Partner testimonial gallery">
        {visibleTestimonials.map((testimonial, position) => {
          const originalIndex = (activeIndex + position) % testimonials.length;

          return (
            <Link
              key={testimonial.name}
              href="/company/testimonials"
              className="testimonial-slide"
              data-position={position}
              data-tone={testimonial.tone}
              aria-label={`${testimonial.name}, ${testimonial.role}. Open partner testimonials.`}
              aria-current={position === 0 ? "true" : undefined}
            >
              <span className="testimonial-slide__index" aria-hidden="true">
                {String(originalIndex + 1).padStart(2, "0")}
              </span>
              {position === 0 ? (
                <span className="testimonial-slide__quote">
                  <span className="testimonial-slide__category">{testimonial.category}</span>
                  <span className="testimonial-slide__mark" aria-hidden="true">
                    “
                  </span>
                  <span className="testimonial-slide__text">{testimonial.quote}</span>
                  <span className="testimonial-slide__byline">
                    <span className="testimonial-slide__avatar" aria-hidden="true">
                      {String(originalIndex + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>{testimonial.name}</strong>
                      <small>{testimonial.role}</small>
                    </span>
                  </span>
                </span>
              ) : position === 1 ? (
                <span className="testimonial-slide__peek">
                  <span>{testimonial.category}</span>
                  <strong>{testimonial.name}</strong>
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="testimonials-carousel__footer">
        <p>Placeholder testimonials shown for layout; replace with approved partner quotes.</p>
        <Link href="/company/testimonials" className="testimonial-more">
          Explore all testimonials
          <HoverArrow />
        </Link>
      </div>
    </div>
  );
}
