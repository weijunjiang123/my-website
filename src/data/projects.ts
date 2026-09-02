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
  outcome: string;
  technologies: string[];
};

export const githubUsername = 'weijunjiang123';

// Public, original repositories selected for the portfolio. GitHub metadata is
// refreshed in the browser, with these values serving as a static fallback.
const projectContent = [
  { id: '01', name: 'auto-input', year: '2026', language: 'Swift', stars: 2, forks: 0, technologies: ['Swift', 'AppKit', 'macOS'], description: { en: 'A lightweight menu bar utility that switches input methods for the active macOS app.', zh: '轻量 macOS 菜单栏应用，按前台应用自动切换输入法。' }, outcome: { en: 'Removes a small, repeated interruption from multilingual desktop work.', zh: '减少多语言桌面工作中反复切换输入法的打断。' }, category: { en: 'macOS · Developer Utility', zh: 'macOS · 开发者工具' } },
  { id: '02', name: 'skill-repo', year: '2026', language: 'Python', stars: 3, forks: 0, technologies: ['Python', 'Agents', 'Tooling'], description: { en: 'A collection of reusable skills for AI-assisted development workflows.', zh: '面向 AI 辅助开发工作流的可复用 Skill 集合。' }, outcome: { en: 'Turns repeatable engineering practices into portable agent capabilities.', zh: '将可重复的工程实践沉淀为可移植的智能体能力。' }, category: { en: 'AI Development · Python', zh: 'AI 开发 · Python' } },
  { id: '03', name: 'graph_text2sql', year: '2025', language: 'Python', stars: 0, forks: 0, technologies: ['Python', 'Text-to-SQL', 'Knowledge Graph'], description: { en: 'A graph-based approach to natural-language-to-SQL workflows.', zh: '用图结构增强自然语言到 SQL 的生成工作流。' }, outcome: { en: 'Explores more grounded query generation through explicit schema relationships.', zh: '通过显式的 Schema 关系，探索更可靠的查询生成。' }, category: { en: 'Text-to-SQL · Knowledge Graph', zh: 'Text-to-SQL · 知识图谱' } },
  { id: '04', name: 'graphragflow', year: '2025', language: 'Python', stars: 3, forks: 1, technologies: ['Python', 'GraphRAG', 'Local LLMs'], description: { en: 'A GraphRAG pipeline designed to run with local language models.', zh: '一套可使用本地大模型运行的 GraphRAG 流程。' }, outcome: { en: 'Connects local inference with graph-aware retrieval in one practical pipeline.', zh: '将本地推理与图感知检索整合到一条可用流水线中。' }, category: { en: 'GraphRAG · Local LLMs', zh: 'GraphRAG · 本地大模型' } },
] as const;

export const getProjects = (locale: 'en' | 'zh'): Project[] => projectContent.map((project) => ({
  id: project.id,
  title: project.name,
  category: project.category[locale],
  year: project.year,
  description: project.description[locale],
  outcome: project.outcome[locale],
  technologies: [...project.technologies],
  url: `https://github.com/${githubUsername}/${project.name}`,
  language: project.language,
  stars: project.stars,
  forks: project.forks,
}));
