// ───────────────────────────────────────────────────────────────────────────
// All portfolio content lives in this one file.
// Edit it in VS Code or on GitHub, commit, and push to main to publish.
// Images, videos and PDFs go in public/media/ and are referenced as
// "media/filename.ext" (full HTTPS URLs work too).
// ───────────────────────────────────────────────────────────────────────────

export const initialData = {
  version: 2,

  profile: {
    name: "A.V. Bharath Kumar Reddy",
    shortName: "Bharath",
    role: "Full-stack developer & AI enthusiast",
    // Lines are separated with \n — each line animates in on its own.
    headline: "Build things.\nBreak boring.",
    intro:
      "A curious developer turning “what if?” into things you can click, use and love. Full-stack thinking, a soft spot for AI, and an obsession with how things feel.",
    summary:
      "I’m a final-year student and curious builder at the intersection of software, data and design. I enjoy connecting the dots — from an idea on paper to a working product that makes someone’s day a little easier.",
    summaryExtra:
      "My interests span Java full-stack development, intelligent systems and thoughtful interfaces. Away from the keyboard you’ll find me playing cricket, thinking a few moves ahead in chess, or learning something new.",
    location: "India",
    email: "avbharath2002@gmail.com",
    github: "https://github.com/bharathkumarreddy007",
    linkedin:
      "https://www.linkedin.com/in/venkata-bharath-kumar-ambavarapu-3836a9386/",
    availability: "Open to opportunities",
    photo: null,
    skills: [
      "Java",
      "Python",
      "JavaScript",
      "HTML & CSS",
      "SQL",
      "Machine Learning",
      "Pandas",
      "Git & GitHub",
      "Responsive Design",
      "Problem Solving",
    ],
    // Short, honest numbers for the about section.
    stats: [
      { value: "Final year", label: "B.Tech student" },
      { value: "10+", label: "Tools in the toolkit" },
      { value: "3", label: "Featured projects" },
      { value: "Always", label: "Learning something new" },
    ],
    // What I actually do — shown as cards in the about section.
    capabilities: [
      {
        title: "Full-stack engineering",
        detail:
          "From schema to screen. Java and Spring on the back end, clean JavaScript and responsive markup up front.",
        tags: ["Java", "Spring", "MySQL", "REST"],
      },
      {
        title: "Data & machine learning",
        detail:
          "Making messy numbers say something useful — analysis, similarity, and recommendations that feel personal.",
        tags: ["Python", "Pandas", "ML", "SQL"],
      },
      {
        title: "Interface craft",
        detail:
          "Interfaces that are quick, legible and a little bit playful. Motion with a purpose, never decoration for its own sake.",
        tags: ["React", "Motion", "Design systems", "Accessibility"],
      },
    ],
  },

  projects: [
    {
      id: "secure-query",
      title: "Secure Query Processing",
      category: "Full-stack",
      description:
        "Exploring secure, searchable cloud data. A system that brings Java and MySQL together to query encrypted information.",
      tags: ["Java", "MySQL", "Cloud"],
      year: "Featured project",
      visual: "terminal",
      url: "",
      repo: "https://github.com/bharathkumarreddy007",
      video: null,
      cover: null,
      challenge:
        "How can we make cloud data searchable while keeping sensitive information protected?",
      solution:
        "A Java and MySQL project exploring encrypted storage and secure query processing.",
      outcome:
        "A practical exploration of data security, backend architecture and query design.",
    },
    {
      id: "commerce",
      title: "E-Commerce Dashboard",
      category: "Data & AI",
      description:
        "Turning sales data into a clearer picture. An analytics project exploring the patterns behind products, customers and revenue.",
      tags: ["Python", "SQL", "Tableau"],
      year: "Featured project",
      visual: "chart",
      url: "",
      repo: "https://github.com/bharathkumarreddy007",
      video: null,
      cover: null,
      challenge: "Make raw sales data easier to explore and understand.",
      solution:
        "Use Python, SQL, Pandas and Tableau to analyse data and present the findings visually.",
      outcome:
        "An exploration of the complete analytics workflow, from raw data to visual storytelling.",
    },
    {
      id: "movies",
      title: "Movie Recommendation System",
      category: "Data & AI",
      description:
        "A little less searching, a little more watching. Discovering relevant films through content-based recommendations.",
      tags: ["Python", "Machine Learning"],
      year: "Featured project",
      visual: "movies",
      url: "",
      repo: "https://github.com/bharathkumarreddy007",
      video: null,
      cover: null,
      challenge:
        "Help people discover films related to the stories they already enjoy.",
      solution:
        "Explore content-based filtering to compare movie features and recommend similar titles.",
      outcome:
        "Hands-on learning in recommendation systems and similarity-based retrieval.",
    },
  ],

  // Add entries here and the experience timeline section appears automatically.
  // Shape: { id, role, company, period, description }
  experience: [],

  resumes: [
    {
      id: "original-resume",
      title: "My résumé",
      detail: "Professional background & skills",
      date: "",
      url: "https://drive.google.com/file/d/1pp4AJqVZAAVXqH6xTy7bdN1h85g72gkd/view",
    },
  ],
};
