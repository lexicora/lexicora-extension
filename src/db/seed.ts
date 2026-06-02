import { RxDatabase } from "rxdb";
import { uuidv7 } from "uuidv7";

const USER_ID = "00000000-0000-0000-0000-000000000000";

const topicsData = [
  {
    name: "Frontend Mastercraft",
    description:
      "Resources, libraries, and frameworks for modern frontend web development.",
    tags: ["webdev", "frontend", "javascript", "react"],
    entries: [
      {
        title: "React - The library for web and native user interfaces",
        url: "https://react.dev/",
        desc: "Official React documentation and tutorials.",
      },
      {
        title: "Vue.js - The Progressive JavaScript Framework",
        url: "https://vuejs.org/",
        desc: "Accessible, performant and versatile framework for building web user interfaces.",
      },
      {
        title: "MDN Web Docs",
        url: "https://developer.mozilla.org/en-US/",
        desc: "The Mozilla Developer Network (MDN) repository of web documentation.",
      },
      {
        title: "Svelte - Cybernetically enhanced web apps",
        url: "https://svelte.dev/",
        desc: "Svelte resolves components into highly efficient imperative code that surgically updates the DOM.",
      },
      {
        title: "Tailwind CSS",
        url: "https://tailwindcss.com/",
        desc: "A utility-first CSS framework packed with classes that can be composed to build any design.",
      },
      {
        title: "TypeScript",
        url: "https://www.typescriptlang.org/",
        desc: "TypeScript is a strongly typed programming language that builds on JavaScript.",
      },
      {
        title: "Vite JS",
        url: "https://vitejs.dev/",
        desc: "Next Generation Frontend Tooling. Get ready for a development environment that can finally catch up with you.",
      },
      {
        title: "Smashing Magazine",
        url: "https://www.smashingmagazine.com/",
        desc: "For Web Designers And Developers.",
      },
      {
        title: "Frontend Mentor",
        url: "https://www.frontendmentor.io/",
        desc: "Improve your front-end coding skills by building real projects.",
      },
      {
        title: "CSS-Tricks",
        url: "https://css-tricks.com/",
        desc: "Daily articles about CSS, HTML, JavaScript, and all things related to web design and development.",
      },
      {
        title: "Framer Motion",
        url: "https://www.framer.com/motion/",
        desc: "An open source, production-ready motion library for React on the web.",
      },
    ],
  },
  {
    name: "Artificial Intelligence & ML",
    description:
      "Papers, guides, and tools for working with artificial intelligence.",
    tags: ["ai", "machine-learning", "python", "llm"],
    entries: [
      {
        title: "Hugging Face",
        url: "https://huggingface.co/",
        desc: "The AI community building the future. Build, train and deploy state of the art models.",
      },
      {
        title: "TensorFlow",
        url: "https://www.tensorflow.org/",
        desc: "An end-to-end open source machine learning platform.",
      },
      {
        title: "PyTorch",
        url: "https://pytorch.org/",
        desc: "An open source machine learning framework that accelerates the path from research prototyping to production deployment.",
      },
      {
        title: "OpenAI Platform",
        url: "https://platform.openai.com/docs/",
        desc: "Explore resources, tutorials, and API docs for OpenAI.",
      },
      {
        title: "Papers with Code",
        url: "https://paperswithcode.com/",
        desc: "The latest in Machine Learning - highlight trending research and code.",
      },
      {
        title: "Kaggle",
        url: "https://www.kaggle.com/",
        desc: "Kaggle is the world's largest data science community with powerful tools and resources.",
      },
      {
        title: "Anthropic",
        url: "https://www.anthropic.com/",
        desc: "AI research and products that put safety at the frontier.",
      },
      {
        title: "LangChain",
        url: "https://www.langchain.com/",
        desc: "Framework for developing applications powered by language models.",
      },
      {
        title: "Fast.ai",
        url: "https://www.fast.ai/",
        desc: "Making neural nets uncool again. Free courses on AI and deep learning.",
      },
      {
        title: "Scikit-Learn",
        url: "https://scikit-learn.org/",
        desc: "Machine Learning in Python. Simple and efficient tools for predictive data analysis.",
      },
      {
        title: "Google DeepMind",
        url: "https://deepmind.google/",
        desc: "A team of scientists, engineers, and researchers committed to solving intelligence.",
      },
    ],
  },
  {
    name: "Design Systems & UI",
    description:
      "Inspiration and documentation for design systems and UI patterns.",
    tags: ["design", "ui", "ux", "system"],
    entries: [
      {
        title: "Material Design",
        url: "https://m3.material.io/",
        desc: "Material Design is an adaptable system of guidelines, components, and tools that support the best practices of user interface design.",
      },
      {
        title: "Apple Human Interface Guidelines",
        url: "https://developer.apple.com/design/human-interface-guidelines/",
        desc: "Get in-depth information and UI resources for designing great apps.",
      },
      {
        title: "Mobbin",
        url: "https://mobbin.com/",
        desc: "Discover the latest iOS UI design patterns.",
      },
      {
        title: "Radix UI",
        url: "https://www.radix-ui.com/",
        desc: "Unstyled, accessible components for building high-quality design systems and web apps in React.",
      },
      {
        title: "Shadcn UI",
        url: "https://ui.shadcn.com/",
        desc: "Beautifully designed components that you can copy and paste into your apps.",
      },
      {
        title: "Awwwards",
        url: "https://www.awwwards.com/",
        desc: "Awwwards are the Website Awards that recognize and promote the talent and effort of the best developers, designers and web agencies.",
      },
      {
        title: "Dribbble",
        url: "https://dribbble.com/",
        desc: "Find Top Designers & Creative Professionals on Dribbble.",
      },
      {
        title: "Nielsen Norman Group",
        url: "https://www.nngroup.com/",
        desc: "Evidence-Based User Experience Research, Training, and Consulting.",
      },
      {
        title: "Behance",
        url: "https://www.behance.net/",
        desc: "Showcase and discover creative work on the world's leading online platform for creative professionals.",
      },
      {
        title: "Laws of UX",
        url: "https://lawsofux.com/",
        desc: "A collection of best practices that designers can consider when building user interfaces.",
      },
      {
        title: "Design Systems Repo",
        url: "https://designsystemsrepo.com/",
        desc: "A frequently updated collection of Design System examples, articles, tools and talks.",
      },
    ],
  },
  {
    name: "DevOps & Cloud Ecosystem",
    description:
      "Cloud computing, CI/CD, and infrastructure as code resources.",
    tags: ["devops", "cloud", "infrastructure", "aws"],
    entries: [
      {
        title: "Docker",
        url: "https://www.docker.com/",
        desc: "Empowering App Development for Developers.",
      },
      {
        title: "Kubernetes",
        url: "https://kubernetes.io/",
        desc: "Production-Grade Container Orchestration.",
      },
      {
        title: "Terraform",
        url: "https://www.terraform.io/",
        desc: "Automate infrastructure on any cloud with Terraform.",
      },
      {
        title: "AWS Documentation",
        url: "https://docs.aws.amazon.com/",
        desc: "Find user guides, developer guides, API references, and tutorials for Amazon Web Services.",
      },
      {
        title: "GitHub Actions",
        url: "https://github.com/features/actions",
        desc: "Automate your workflow from idea to production.",
      },
      {
        title: "Vercel",
        url: "https://vercel.com/",
        desc: "Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.",
      },
      {
        title: "Cloudflare",
        url: "https://www.cloudflare.com/",
        desc: "Cloudflare provides a scalable, easy-to-use, unified control plane to deliver security, performance, and reliability.",
      },
      {
        title: "Prometheus",
        url: "https://prometheus.io/",
        desc: "An open-source systems monitoring and alerting toolkit.",
      },
      {
        title: "Grafana",
        url: "https://grafana.com/",
        desc: "The open observability platform.",
      },
      {
        title: "Ansible",
        url: "https://www.ansible.com/",
        desc: "Automate IT infrastructure with Ansible.",
      },
      {
        title: "DigitalOcean",
        url: "https://www.digitalocean.com/",
        desc: "The developer cloud. Helping developers easily build, test, manage, and scale applications of any size.",
      },
    ],
  },
  {
    name: "Cybersecurity & Infosec",
    description: "Articles, tools, and training platforms for cybersecurity.",
    tags: ["security", "hacking", "infosec", "privacy"],
    entries: [
      {
        title: "OWASP Foundation",
        url: "https://owasp.org/",
        desc: "The Open Worldwide Application Security Project.",
      },
      {
        title: "Hack The Box",
        url: "https://www.hackthebox.com/",
        desc: "A massive hacking playground and infosec community.",
      },
      {
        title: "TryHackMe",
        url: "https://tryhackme.com/",
        desc: "Bite-sized cyber security training.",
      },
      {
        title: "Krebs on Security",
        url: "https://krebsonsecurity.com/",
        desc: "In-depth security news and investigation.",
      },
      {
        title: "Exploit Database",
        url: "https://www.exploit-db.com/",
        desc: "An archive of public exploits and corresponding vulnerable software, developed for use by penetration testers and vulnerability researchers.",
      },
      {
        title: "Shodan",
        url: "https://www.shodan.io/",
        desc: "The search engine for the Internet of Things.",
      },
      {
        title: "NIST Cybersecurity Framework",
        url: "https://www.nist.gov/cyberframework",
        desc: "Voluntary guidance based on existing standards, guidelines, and practices for organizations to better manage and reduce cybersecurity risk.",
      },
      {
        title: "Troy Hunt",
        url: "https://www.troyhunt.com/",
        desc: "Microsoft Regional Director and MVP for Developer Security.",
      },
      {
        title: "Have I Been Pwned",
        url: "https://haveibeenpwned.com/",
        desc: "Check if your email or phone is in a data breach.",
      },
      {
        title: "PortSwigger Web Security Academy",
        url: "https://portswigger.net/web-security",
        desc: "Free, interactive web security training from the creators of Burp Suite.",
      },
    ],
  },
  {
    name: "Startups & Entrepreneurship",
    description: "Advice for founders and bootstrapping startups.",
    tags: ["business", "startup", "founder", "funding"],
    entries: [
      {
        title: "Y Combinator Startup Library",
        url: "https://www.ycombinator.com/library",
        desc: "Podcasts, videos, and essays for startup founders.",
      },
      {
        title: "Indie Hackers",
        url: "https://www.indiehackers.com/",
        desc: "Work together to build profitable online businesses.",
      },
      {
        title: "Product Hunt",
        url: "https://www.producthunt.com/",
        desc: "The best new products, every day.",
      },
      {
        title: "Hacker News",
        url: "https://news.ycombinator.com/",
        desc: "A social news website focusing on computer science and entrepreneurship.",
      },
      {
        title: "Stripe Atlas",
        url: "https://stripe.com/atlas",
        desc: "A powerful, safe, and easy-to-use platform for forming a company.",
      },
      {
        title: "TechCrunch",
        url: "https://techcrunch.com/",
        desc: "Reporting on the business of technology, startups, venture capital funding, and Silicon Valley.",
      },
      {
        title: "First Round Review",
        url: "https://review.firstround.com/",
        desc: "Actionable insights for technology entrepreneurs.",
      },
      {
        title: "MicroConf",
        url: "https://microconf.com/",
        desc: "The most trusted community of independent software founders.",
      },
      {
        title: "Naval Ravikant Almanack",
        url: "https://www.navalmanack.com/",
        desc: "A guide to wealth and happiness.",
      },
      {
        title: "Paul Graham Essays",
        url: "http://paulgraham.com/articles.html",
        desc: "Essays by Paul Graham, programmer, writer, and investor.",
      },
    ],
  },
  {
    name: "Data Science & Analytics",
    description: "Tools for making sense of large datasets.",
    tags: ["data", "analytics", "sql", "dashboard"],
    entries: [
      {
        title: "Pandas",
        url: "https://pandas.pydata.org/",
        desc: "Fast, powerful, flexible and easy to use open source data analysis and manipulation tool.",
      },
      {
        title: "PostgreSQL",
        url: "https://www.postgresql.org/",
        desc: "The world's most advanced open source relational database.",
      },
      {
        title: "Metabase",
        url: "https://www.metabase.com/",
        desc: "The easy, open source way for everyone in your company to ask questions and learn from data.",
      },
      {
        title: "Apache Spark",
        url: "https://spark.apache.org/",
        desc: "Unified engine for large-scale data analytics.",
      },
      {
        title: "Tableau",
        url: "https://www.tableau.com/",
        desc: "Business intelligence and analytics software.",
      },
      {
        title: "dbt (data build tool)",
        url: "https://www.getdbt.com/",
        desc: "dbt enables data analysts and engineers to transform their data using the same practices that software engineers use to build applications.",
      },
      {
        title: "Snowflake",
        url: "https://www.snowflake.com/",
        desc: "The Data Cloud platform.",
      },
      {
        title: "Supabase",
        url: "https://supabase.com/",
        desc: "The open source Firebase alternative.",
      },
      {
        title: "DataCamp",
        url: "https://www.datacamp.com/",
        desc: "Learn Python, R, and SQL online.",
      },
      {
        title: "Towards Data Science",
        url: "https://towardsdatascience.com/",
        desc: "Sharing concepts, ideas and codes on Data Science.",
      },
    ],
  },
  {
    name: "Functional Programming",
    description: "Pure functions, immutability, and algebraic data types.",
    tags: ["fp", "haskell", "clojure", "elixir"],
    entries: [
      {
        title: "Elixir Lang",
        url: "https://elixir-lang.org/",
        desc: "A dynamic, functional language designed for building scalable and maintainable applications.",
      },
      {
        title: "Haskell",
        url: "https://www.haskell.org/",
        desc: "An advanced, purely functional programming language.",
      },
      {
        title: "Clojure",
        url: "https://clojure.org/",
        desc: "A robust, practical, and fast programming language with a set of useful features.",
      },
      {
        title: "Elm",
        url: "https://elm-lang.org/",
        desc: "A delightful language for reliable webapps.",
      },
      {
        title: "F#",
        url: "https://fsharp.org/",
        desc: "F# is an open-source, cross-platform programming language that makes it easy to write succinct, robust, and performant code.",
      },
      {
        title: "Rust",
        url: "https://www.rust-lang.org/",
        desc: "A language empowering everyone to build reliable and efficient software.",
      },
      {
        title: "Learn You a Haskell",
        url: "http://learnyouahaskell.com/",
        desc: "The most robust, fun, and easy way to learn Haskell.",
      },
      {
        title: "Structure and Interpretation of Computer Programs",
        url: "https://mitpress.mit.edu/9780262510875/structure-and-interpretation-of-computer-programs/",
        desc: "SICP - A classic computer science textbook.",
      },
      {
        title: "ReasonML",
        url: "https://reasonml.github.io/",
        desc: "Syntax and toolchain for OCaml, meant for web developers.",
      },
      {
        title: "Gleam",
        url: "https://gleam.run/",
        desc: "A friendly language for building type-safe, scalable systems!",
      },
    ],
  },
  {
    name: "Productivity & Note-taking",
    description: "Tools to organize thoughts and tasks.",
    tags: ["organization", "notes", "tasks", "tools"],
    entries: [
      {
        title: "Notion",
        url: "https://www.notion.so/",
        desc: "The all-in-one workspace for your notes, tasks, wikis, and databases.",
      },
      {
        title: "Obsidian",
        url: "https://obsidian.md/",
        desc: "A powerful knowledge base on top of a local folder of plain text Markdown files.",
      },
      {
        title: "Todoist",
        url: "https://todoist.com/",
        desc: "The to do list to organize work & life.",
      },
      {
        title: "Things 3",
        url: "https://culturedcode.com/things/",
        desc: "The award-winning personal task manager that helps you achieve your goals.",
      },
      {
        title: "Raycast",
        url: "https://www.raycast.com/",
        desc: "Supercharge your productivity with a blazing fast, totally extendable launcher.",
      },
      {
        title: "Linear",
        url: "https://linear.app/",
        desc: "The issue tracking tool you'll enjoy using.",
      },
      {
        title: "Logseq",
        url: "https://logseq.com/",
        desc: "A privacy-first, open-source knowledge base.",
      },
      {
        title: "Arc Browser",
        url: "https://arc.net/",
        desc: "A new kind of browser, crafted for the way you use the internet today.",
      },
      {
        title: "Zettelkasten Method",
        url: "https://zettelkasten.de/",
        desc: "Improve your note-taking and thinking.",
      },
      {
        title: "Tiago Forte - Building a Second Brain",
        url: "https://fortelabs.com/",
        desc: "A methodology for saving and systematically reminding us of the ideas, inspirations, insights, and connections we've gained through our experience.",
      },
    ],
  },
  {
    name: "Open Source Projects",
    description:
      "Key projects shaping the modern infrastructure and software landscape.",
    tags: ["oss", "linux", "apache", "free-software"],
    entries: [
      {
        title: "Linux Foundation",
        url: "https://www.linuxfoundation.org/",
        desc: "The premier home for open source, housing Linux, Kubernetes, Node.js, and more.",
      },
      {
        title: "Apache Software Foundation",
        url: "https://www.apache.org/",
        desc: "Provides software for the public good, supporting over 300 active open source projects.",
      },
      {
        title: "Mozilla Foundation",
        url: "https://foundation.mozilla.org/",
        desc: "Working to ensure the internet remains a public resource that is open and accessible to all.",
      },
      {
        title: "Electronic Frontier Foundation",
        url: "https://www.eff.org/",
        desc: "Defending digital privacy, free speech, and innovation.",
      },
      {
        title: "Free Software Foundation",
        url: "https://www.fsf.org/",
        desc: "Campaigning for computer user freedom.",
      },
      {
        title: "GitHub Explore",
        url: "https://github.com/explore",
        desc: "Navigate your interests and discover upcoming open source projects.",
      },
      {
        title: "Open Source Initiative",
        url: "https://opensource.org/",
        desc: "The steward of the Open Source Definition.",
      },
      {
        title: "GNU Operating System",
        url: "https://www.gnu.org/",
        desc: "A free software operating system.",
      },
      {
        title: "Vim",
        url: "https://www.vim.org/",
        desc: "A highly configurable text editor built to enable efficient text editing.",
      },
      {
        title: "React Router",
        url: "https://reactrouter.com/",
        desc: "Declarative routing for React.",
      },
    ],
  },
];

export async function seedDummyData(db: RxDatabase) {
  // Check if we already have data to prevent duplicate seeding
  const existingTopics = await db.collections.topics.find().exec();
  if (existingTopics.length > 0) {
    return;
  }

  console.log("🌱 Seeding genuine dummy data for development...");

  const now = new Date().toISOString();

  const topicsToInsert: any[] = [];
  const entriesToInsert: any[] = [];

  for (const t of topicsData) {
    const topicId = uuidv7();
    const isTopicArchived = Math.random() > 0.92;
    const isTopicPinned = !isTopicArchived && Math.random() > 0.9;
    const isTopicFavorite = !isTopicArchived && Math.random() > 0.8;

    topicsToInsert.push({
      id: topicId,
      userId: USER_ID,
      name: t.name,
      description: t.description,
      tags: t.tags,
      isFavorite: isTopicFavorite,
      isPinned: isTopicPinned,
      isArchived: isTopicArchived,
      createdAt: now,
      updatedAt: now,
    });

    for (const e of t.entries) {
      const urlObj = new URL(e.url);
      const isEntryArchived = Math.random() > 0.92;
      const isEntryPinned = !isEntryArchived && Math.random() > 0.9;
      const isEntryFavorite = !isEntryArchived && Math.random() > 0.8;

      entriesToInsert.push({
        id: uuidv7(),
        userId: USER_ID,
        topicId: topicId,
        title: e.title,
        description: e.desc,
        tags: [
          ...t.tags.slice(0, 2),
          e.title.toLowerCase().split(" ")[0],
          "resource",
        ],
        isFavorite: isEntryFavorite,
        isPinned: isEntryPinned,
        isArchived: isEntryArchived,
        languageCode: "en",
        url: e.url,
        hostnameUrl: urlObj.hostname,
        pathnameUrl: urlObj.pathname,
        searchUrl: urlObj.search,
        siteName: e.title.split(" - ")[0].split(" ")[0], // Minimal site name attempt
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await db.collections.topics.bulkInsert(topicsToInsert);
  await db.collections.entries.bulkInsert(entriesToInsert);

  console.log(
    `✅ Seeded ${topicsToInsert.length} topics and ${entriesToInsert.length} entries.`,
  );
}
