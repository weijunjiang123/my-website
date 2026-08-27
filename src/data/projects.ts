export type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  forks: number;
};

export const githubUsername = 'weijunjiang123';

// Public, original repositories selected for the portfolio. GitHub metadata is
// refreshed in the browser, with these values serving as a static fallback.
const projectContent = [
  { id: '01', name: 'auto-input', year: '2026', language: 'Swift', stars: 2, forks: 0, description: '轻量 macOS 菜单栏应用，按前台应用自动切换输入法。', category: { en: 'macOS · Developer Utility', zh: 'macOS · 开发者工具' } },
  { id: '02', name: 'skill-repo', year: '2026', language: 'Python', stars: 3, forks: 0, description: 'A collection of reusable skills for AI-assisted development workflows.', category: { en: 'AI Development · Python', zh: 'AI 开发 · Python' } },
  { id: '03', name: 'graph_text2sql', year: '2025', language: 'Python', stars: 0, forks: 0, description: 'Exploring graph-based approaches to natural-language-to-SQL workflows.', category: { en: 'Text-to-SQL · Knowledge Graph', zh: 'Text-to-SQL · 知识图谱' } },
  { id: '04', name: 'graphragflow', year: '2025', language: 'Python', stars: 3, forks: 1, description: 'A GraphRAG pipeline using local LLMs.', category: { en: 'GraphRAG · Local LLMs', zh: 'GraphRAG · 本地大模型' } },
] as const;

export const getProjects = (locale: 'en' | 'zh'): Project[] => projectContent.map((project) => ({
  id: project.id,
  title: project.name,
  category: project.category[locale],
  year: project.year,
  description: project.description,
  url: `https://github.com/${githubUsername}/${project.name}`,
  language: project.language,
  stars: project.stars,
  forks: project.forks,
}));
