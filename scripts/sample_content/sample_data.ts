/**
 * Sample notes and credentials, shaped to stress the layout: a very long
 * title, no tags and many tags, a code line wider than the column, tall and
 * wide images, credentials with and without badges, expiry and verify links.
 * Every one is labelled as a sample.
 */

const filler = (sentences: number) =>
  Array.from(
    { length: sentences },
    (_, i) =>
      [
        "The rollout ran behind a feature flag for a week before it took real traffic.",
        "Most of the time went into the migration, not the code that used it.",
        "We measured before and after on the same hardware, at the same hour of the day.",
        "Nothing here needed a new service; it needed the old one to stop doing two jobs.",
      ][i % 4],
  ).join(" ");

export const SAMPLE_NOTES: Record<string, unknown> = {
  "sample-zero-downtime-deploys": {
    title: "Sample: zero-downtime deploys on a single on-prem box",
    date: "2026-09-21",
    summary:
      "Sample post. Blue-green containers behind Traefik, health checks that mean something, and a rollback that takes one command.",
    tags: ["devops", "docker", "traefik"],
    body: [
      `Opening paragraph with **bold**, *italic*, \`inline code\` and a [link to the docs](https://doc.traefik.io/traefik/). ${filler(6)}`,
      { type: "heading", text: "What the old deploy did" },
      {
        type: "list",
        ordered: true,
        items: [
          "Stopped the container, pulled the image, started it again.",
          "Waited for nothing. The health check only proved the port was open.",
          "Dropped every open WebSocket on every release.",
        ],
      },
      {
        type: "code",
        lang: "yaml",
        code: 'services:\n  api:\n    image: registry.local/usapp/api:${TAG}\n    healthcheck:\n      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health/ready?include=db,redis,queue&timeout=2000&verbose=true"]\n      interval: 5s\n      retries: 6',
      },
      filler(8),
      {
        type: "image",
        src: "/notes/sample-deploy-timeline.webp",
        alt: "Sample chart of deploy duration over six weeks",
        caption: "Sample image, wide (21:9).",
      },
      {
        type: "quote",
        text: "A health check that only proves the port is open is a liveness check wearing a costume.",
      },
      filler(10),
    ],
  },
  "sample-a-very-long-title": {
    title:
      "Sample: what a deliberately long note title does to the list, the post header and the newer/older links at the bottom",
    date: "2026-08-30",
    summary: "Sample post with a long title and no tags.",
    tags: [],
    body: [filler(12), filler(9)],
  },
  "sample-tall-image": {
    title: "Sample: tall screenshots",
    date: "2026-07-14",
    summary:
      "Sample post with a phone-shaped image and many tags, to check wrapping in the row and the filter.",
    tags: ["mobile", "react-native", "expo", "offline-first", "sync", "sqlite"],
    body: [
      filler(4),
      {
        type: "image",
        src: "/notes/sample-phone-screen.webp",
        alt: "Sample phone screen",
        caption: "Sample image, tall (9:19.5).",
      },
      filler(5),
    ],
  },
  "sample-security-review": {
    title: "Sample: notes from a security review",
    date: "2026-05-02",
    summary: "Sample post, short.",
    tags: ["security"],
    body: [
      filler(3),
      {
        type: "list",
        items: [
          "Rotate refresh tokens on use.",
          "Rate-limit by user, then by IP.",
        ],
      },
    ],
  },
  "sample-unpublished-draft": {
    title: "Sample: a draft that must never show",
    date: "2026-10-01",
    summary: "If you can see this on the site, drafts are leaking.",
    draft: true,
    body: ["Draft."],
  },
};

export const SAMPLE_CERTIFICATIONS = [
  {
    id: "sample-aws-saa",
    name: "Sample: AWS Certified Solutions Architect · Associate",
    issuer: "Amazon Web Services",
    issued: "2026-03",
    expires: "2029-03",
    credentialId: "SAMPLE-AWS-0F3A-91C2",
    verifyUrl: "https://example.com/verify/aws",
    image: "/certifications/sample-aws.webp",
    imageAlt: "Sample AWS badge",
    skills: ["AWS", "Architecture", "Networking"],
  },
  {
    id: "sample-ckad",
    name: "Sample: Certified Kubernetes Application Developer",
    issuer: "The Linux Foundation",
    issued: "2025-11",
    expires: "2027-11",
    credentialId: "LF-SAMPLE-CKAD-000000000000000000",
    verifyUrl: "https://example.com/verify/ckad",
    image: "/certifications/sample-lf.webp",
    imageAlt: "Sample Linux Foundation badge",
    skills: ["Kubernetes", "Containers"],
  },
  {
    id: "sample-long-name",
    name: "Sample: a credential with a deliberately long name that has to wrap across several lines in a narrow card",
    issuer: "An Issuer With A Rather Long Organisation Name",
    issued: "2024",
    expires: null,
    skills: [
      "Security",
      "Compliance",
      "Risk",
      "Governance",
      "Audit",
      "ISO 27001",
      "SOC 2",
      "Policy",
    ],
  },
  {
    id: "sample-no-verify",
    name: "Sample: course certificate without a verify link",
    issuer: "Sample Academy",
    issued: "Mar 2023",
    image: "/certifications/sample-academy.webp",
    imageAlt: "Sample academy badge",
    skills: ["Networking"],
  },
  {
    id: "sample-missing-badge",
    name: "Sample: badge file that does not exist",
    issuer: "Sample Issuer",
    issued: "2022-06",
    expires: "2024-06",
    verifyUrl: "https://example.com/verify/expired",
    image: "/certifications/sample-not-uploaded.webp",
    skills: ["Security"],
  },
];

/** Badge images to draw: the slots above that should exist after seeding. */
export const SAMPLE_BADGES: Record<string, string> = {
  "/certifications/sample-aws.webp": "AWS",
  "/certifications/sample-lf.webp": "LF",
  "/certifications/sample-academy.webp": "SA",
};

/** Sample recommendations, one of each relationship, linked to real ids. */
export const SAMPLE_RECOMMENDATIONS = [
  {
    id: "sample-employer",
    name: "Sample Employer",
    role: "Chief Technology Officer",
    organization: "YouCode Technologies",
    relationship: "employer",
    quote:
      "Sample quote. He took systems from an empty repository to production on his own, and kept them running: when something broke at night, the fix and the write-up were both in by morning.",
    date: "Sep 2026",
    experience: "youcode",
    project: "usapp",
  },
  {
    id: "sample-colleague",
    name: "Sample Colleague",
    role: "Mobile Developer",
    organization: "YouCode Technologies",
    relationship: "colleague",
    quote:
      "Sample quote of medium length. His pull requests explained why, not just what, which made reviewing them a way to learn the system.",
    date: "Aug 2026",
    experience: "youcode",
  },
  {
    id: "sample-client",
    name: "Sample Client",
    role: "Owner",
    organization: "Sample Auto Shop",
    relationship: "client",
    quote:
      "Sample short quote. Our branches stopped losing sales when the internet went down.",
    date: "Jul 2026",
    project: "jms-e-talyer",
  },
  {
    id: "sample-end-user",
    name: "Sample End User",
    role: "Daily user",
    relationship: "end-user",
    quote:
      "Sample quote from someone who uses the app. Messages arrive instantly, and I trust that nobody else can read them.",
    project: "usapp",
  },
  {
    id: "sample-health-worker",
    name: "Sample Health Worker",
    role: "Midwife",
    organization: "Victoria Municipal Health Office",
    relationship: "end-user",
    quote:
      "Sample quote, deliberately long to test wrapping in the card and in the grid on a phone. Finding a patient's record used to mean searching paper folders; now it takes seconds, and appointments no longer collide.",
    date: "2025",
    project: "kalusugapp",
  },
];
