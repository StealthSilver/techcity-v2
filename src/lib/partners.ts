/**
 * Partner colleges and industry partners: the home page's Partners section and
 * the /partners/colleges and /partners/industries pages.
 *
 * College logos are the pre-trimmed copies in public/logos/ticker;
 * industry logos are in public/partners (froyo-mark.png is the Froyo mark
 * cropped from its white-on-dark wordmark so it reads on a white tile).
 *
 * `founded` and `fact` come from public sources (the institutions' own sites,
 * government compendiums and well-sourced directories), checked in November
 * 2026. Where sources disagreed on a year it is left out rather than guessed.
 * Accreditation grades and rankings are left out on purpose: they expire and
 * sources often conflict.
 */

export type Kind = { label: string; color: string };

export const KIND = {
  university: { label: "University", color: "#1C257D" },
  institute: { label: "Institute", color: "#6B7BE6" },
  technology: { label: "Technology", color: "#F59E0B" },
  training: { label: "Training", color: "#3B47C4" },
} satisfies Record<string, Kind>;

export type Partner = {
  name: string;
  src: string;
  /** City and state for colleges; what they do for industry partners. */
  detail: string;
  kind: Kind;
  /** Year founded, when public sources agree. */
  founded?: number;
  /** One short, sourced line about the partner. */
  fact?: string;
};

export type College = Partner & { city: string; state: State };
export type State = "Uttar Pradesh" | "Punjab" | "Haryana" | "Bihar";

const college = (
  name: string,
  src: string,
  city: string,
  state: State,
  kind: Kind,
  founded: number | undefined,
  fact: string,
): College => ({ name, src, city, state, detail: `${city}, ${state}`, kind, founded, fact });

export const colleges: College[] = [
  college(
    "Ajay Kumar Garg Engineering College",
    "/logos/ticker/akgec.webp",
    "Ghaziabad",
    "Uttar Pradesh",
    KIND.institute,
    1998,
    "AICTE-approved engineering college affiliated to AKTU, Lucknow.",
  ),
  college(
    "KIET University",
    "/logos/ticker/kiet.webp",
    "Ghaziabad",
    "Uttar Pradesh",
    KIND.university,
    1998,
    "Set up by the Krishna Charitable Society, with a first intake of 180 students.",
  ),
  college(
    "Echelon Institute of Technology",
    "/logos/ticker/echelon.webp",
    "Faridabad",
    "Haryana",
    KIND.institute,
    2007,
    "Began as an electronics and communication engineering department.",
  ),
  college(
    "Chitkara University",
    "/logos/ticker/chitkara.webp",
    "Rajpura",
    "Punjab",
    KIND.university,
    2010,
    "A university since 2010; its engineering institute dates to 2002.",
  ),
  college(
    "Inmantec Institutions",
    "/logos/ticker/inmantec.webp",
    "Ghaziabad",
    "Uttar Pradesh",
    KIND.institute,
    1995,
    "Management, computer applications, law, education and pharmacy.",
  ),
  college(
    "KCNIT Group of Institutions",
    "/logos/ticker/kcnit.webp",
    "Banda",
    "Uttar Pradesh",
    KIND.institute,
    2002,
    "Founded under the Banda Education Centre; B.Tech, MBA, BCA and polytechnic.",
  ),
  college(
    "St. Andrews Institute of Technology and Management",
    "/logos/ticker/st-andrews.webp",
    "Gurugram",
    "Haryana",
    KIND.institute,
    undefined,
    "AICTE-approved and affiliated to Maharshi Dayanand University, Rohtak.",
  ),
  college(
    "Chandigarh University",
    "/logos/ticker/chandigarh.webp",
    "Mohali",
    "Punjab",
    KIND.university,
    2012,
    "Established under the Chandigarh University Act, 2012.",
  ),
  college(
    "Shobhit University",
    "/logos/ticker/shobhit.webp",
    "Meerut",
    "Uttar Pradesh",
    KIND.university,
    2006,
    "Deemed to be a university since 2006; its founding society dates to 1989.",
  ),
  college(
    "Jai Prakash Vishwavidyalaya",
    "/logos/ticker/jpu-chapra.webp",
    "Chapra",
    "Bihar",
    KIND.university,
    1990,
    "State university named after Loknayak Jai Prakash Narayan.",
  ),
  college(
    "Adhunik Group of Institutions",
    "/logos/ticker/adhunik.webp",
    "Ghaziabad",
    "Uttar Pradesh",
    KIND.institute,
    2005,
    "Affiliated to AKTU, Lucknow, and CCS University, Meerut.",
  ),
  college(
    "School of Management Sciences",
    "/logos/ticker/sms-lucknow.webp",
    "Lucknow",
    "Uttar Pradesh",
    KIND.institute,
    undefined,
    "The Lucknow campus of the School of Management Sciences, Varanasi.",
  ),
  college(
    "Lovely Professional University",
    "/logos/ticker/lpu.webp",
    "Phagwara",
    "Punjab",
    KIND.university,
    2005,
    "Established by an act of the Punjab legislature; teaching began in 2006.",
  ),
];

/** States in the order they're listed, most campuses first. */
export const states: State[] = ["Uttar Pradesh", "Punjab", "Haryana", "Bihar"];

export type Industry = Partner & {
  group: "training" | "technology";
  /** Featured partners get a larger card with more facts. */
  facts?: string[];
};

export const industry: Industry[] = [
  {
    name: "HCL GUVI",
    src: "/partners/hcl-guvi.webp",
    detail: "Tech upskilling and certification",
    kind: KIND.training,
    group: "training",
    founded: 2014,
    fact: "Programming courses in Tamil, Hindi, Telugu and more.",
    facts: ["Incubated at IIT Madras and IIM Ahmedabad", "Majority-owned by the HCL Group since 2022", "Courses in Indian languages"],
  },
  {
    name: "Chetu",
    src: "/partners/chetu.png",
    detail: "AI and digital transformation",
    kind: KIND.technology,
    group: "technology",
    founded: 2000,
    fact: "Custom software development, with development centres in Noida.",
    facts: ["Custom software and AI development", "Headquartered in Florida, USA", "Development centres in Noida"],
  },
  {
    name: "Hitbullseye",
    src: "/partners/hitbullseye.png",
    detail: "Aptitude and placement preparation",
    kind: KIND.training,
    group: "training",
    fact: "Chandigarh-based test preparation and campus placement training.",
  },
  {
    name: "VTS Infosoft",
    src: "/partners/vts-infosoft.png",
    detail: "Digital transformation",
    kind: KIND.technology,
    group: "technology",
    fact: "Microsoft Dynamics 365 and ERP implementation, based in Delhi-NCR.",
  },
  { name: "Victory Tech Solutions", src: "/partners/victory.png", detail: "Technology solutions", kind: KIND.technology, group: "technology" },
  { name: "epiTech Infosystems", src: "/partners/epitech.png", detail: "IT services", kind: KIND.technology, group: "technology" },
  { name: "Froyo Technologies", src: "/partners/froyo-mark.png", detail: "Technology services", kind: KIND.technology, group: "technology" },
  { name: "Hadwik Data Solutions", src: "/partners/hadwick.jpeg", detail: "IT training and placement", kind: KIND.training, group: "training" },
  { name: "Edcept", src: "/partners/edcept.svg", detail: "Education services", kind: KIND.training, group: "training" },
  { name: "My Edu Galaxy", src: "/partners/my-edu-galaxy.svg", detail: "Education services", kind: KIND.training, group: "training" },
];
