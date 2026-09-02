import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, GitFork, Star } from 'lucide-react';
import { githubUsername, type Project } from '../data/projects';

type WorkCopy = { publicLabel: string; repositoryLabel: string; updatedLabel: string; };
type GitHubRepository = { name: string; description: string | null; html_url: string; language: string | null; stargazers_count: number; forks_count: number; created_at: string; };

function mergeGitHubData(projects: Project[], repositories: GitHubRepository[]) {
  const byName = new Map(repositories.map((repository) => [repository.name, repository]));
  return projects.map((project) => {
    const repository = byName.get(project.title);
    return repository ? { ...project, description: repository.description?.trim() || project.description, url: repository.html_url, language: repository.language || project.language, stars: repository.stargazers_count, forks: repository.forks_count, year: new Date(repository.created_at).getUTCFullYear().toString() } : project;
  });
}

function RepositoryVisual({ project, copy }: { project: Project; copy: WorkCopy }) {
  return <div className="repository-visual">
    <span className="repository-kicker mono"><i /> {copy.publicLabel}</span>
    <div className="repository-content"><h3>{project.title}</h3><p>{project.description}</p></div>
    <div className="repository-meta mono">
      <span>{project.language}</span>
      <div className="repository-stats" aria-label={`${project.stars} stars and ${project.forks} forks`}><span><Star aria-hidden="true" /> {project.stars}</span><span><GitFork aria-hidden="true" /> {project.forks}</span></div>
    </div>
  </div>;
}

export default function ProjectPreview({ projects: initialProjects, copy }: { projects: Project[]; copy: WorkCopy }) {
  const [projects, setProjects] = useState(initialProjects);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://api.github.com/users/${githubUsername}/repos?visibility=public&sort=updated&direction=desc&per_page=100`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<GitHubRepository[]> : Promise.reject(new Error('GitHub request failed')))
      .then((repositories) => setProjects((current) => mergeGitHubData(current, repositories)))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const selectFromTap = (index: number) => {
    setActive(index);
    if (window.matchMedia('(max-width: 640px)').matches) {
      window.requestAnimationFrame(() => previewRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }));
    }
  };
  const activeProject = projects[active] ?? projects[0];
  return <div className="work-interactive" data-reveal>
    <ul className="project-list">
      {projects.map((project, index) => <li key={project.id}><button type="button" className={`project-row ${active===index?'is-active':''}`} onMouseEnter={()=>window.innerWidth>640&&setActive(index)} onFocus={()=>setActive(index)} onClick={()=>selectFromTap(index)} aria-pressed={active===index}>
        <span className="project-index mono">{project.id}</span>
        <span className="project-copy"><span className="project-title">{project.title} <ArrowUpRight aria-hidden="true" /></span><span className="project-category mono">{project.category}</span></span>
        <span className="project-year mono">{project.year}</span>
      </button></li>)}
    </ul>
    <div ref={previewRef} className="project-preview" aria-live="polite" data-interactive-surface>
      <AnimatePresence initial={false}>
        <motion.div
          key={activeProject.id}
          className="preview-inner preview-swap"
          initial={reduce ? false : { opacity: 0, y: 9 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0, y: -6 }}
          transition={{ duration: reduce ? 0 : .4, ease: [.16, 1, .3, 1] }}
        >
          <div className="preview-head mono"><span>{copy.updatedLabel}</span><span>{activeProject.id} / {String(projects.length).padStart(2, '0')}</span></div>
          <RepositoryVisual project={activeProject} copy={copy} />
          <div className="preview-foot mono"><span>{activeProject.category}</span><a href={activeProject.url} target="_blank" rel="noreferrer">{copy.repositoryLabel} <ArrowUpRight aria-hidden="true" /></a></div>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>;
}
