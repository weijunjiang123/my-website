import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, GitFork, Star } from 'lucide-react';
import { githubUsername, type Project } from '../data/projects';

type WorkCopy = { publicLabel: string; repositoryLabel: string; updatedLabel: string; outcomeLabel: string; technologyLabel: string; };
type GitHubRepository = { name: string; description: string | null; html_url: string; language: string | null; stargazers_count: number; forks_count: number; created_at: string; };

function mergeGitHubData(projects: Project[], repositories: GitHubRepository[]) {
  const byName = new Map(repositories.map((repository) => [repository.name, repository]));
  return projects.map((project) => {
    const repository = byName.get(project.title);
    return repository ? { ...project, url: repository.html_url, language: repository.language || project.language, stars: repository.stargazers_count, forks: repository.forks_count, year: new Date(repository.created_at).getUTCFullYear().toString() } : project;
  });
}

function RepositoryVisual({ project, copy }: { project: Project; copy: WorkCopy }) {
  return <div className="repository-visual">
    <span className="repository-kicker mono"><i /> {copy.publicLabel}</span>
    <div className="repository-content">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="repository-outcome"><span className="mono">{copy.outcomeLabel}</span><p>{project.outcome}</p></div>
    </div>
    <div className="repository-meta mono">
      <span><b>{copy.technologyLabel}</b> {project.technologies.join(' / ')}</span>
      <div className="repository-stats" aria-label={`${project.stars} stars and ${project.forks} forks`}><span><Star aria-hidden="true" /> {project.stars}</span><span><GitFork aria-hidden="true" /> {project.forks}</span></div>
    </div>
  </div>;
}

export default function ProjectPreview({ projects: initialProjects, copy }: { projects: Project[]; copy: WorkCopy }) {
  const [projects, setProjects] = useState(initialProjects);
  const [active, setActive] = useState(0);
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://api.github.com/users/${githubUsername}/repos?visibility=public&sort=updated&direction=desc&per_page=100`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<GitHubRepository[]> : Promise.reject(new Error('GitHub request failed')))
      .then((repositories) => setProjects((current) => mergeGitHubData(current, repositories)))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const island = document.querySelector<HTMLElement>('#work astro-island');
    const syncNativeSelection = (event: Event) => {
      const index = Number((event as CustomEvent<{ index?: number }>).detail?.index);
      if (Number.isInteger(index) && index >= 0 && index < initialProjects.length) setActive(index);
    };
    island?.addEventListener('portfolio:project-select', syncNativeSelection);
    const pendingIndex = Number(island?.dataset.activeProject);
    if (Number.isInteger(pendingIndex) && pendingIndex >= 0 && pendingIndex < initialProjects.length) setActive(pendingIndex);
    return () => island?.removeEventListener('portfolio:project-select', syncNativeSelection);
  }, [initialProjects.length]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1025px)');
    let frame = 0;
    const updateFromScroll = () => {
      frame = 0;
      if (!desktop.matches) return;
      const focusedIndex = rowRefs.current.findIndex((row) => row === document.activeElement);
      if (focusedIndex >= 0) {
        setActive(focusedIndex);
        return;
      }
      const target = window.innerHeight * .35;
      const visible = rowRefs.current
        .map((row, index) => ({ row, index, rect: row?.getBoundingClientRect() }))
        .filter((item) => item.row && item.rect && item.rect.bottom > 0 && item.rect.top < window.innerHeight)
        .sort((a, b) => Math.abs(((a.rect?.top ?? 0) + (a.rect?.height ?? 0) / 2) - target) - Math.abs(((b.rect?.top ?? 0) + (b.rect?.height ?? 0) / 2) - target))[0];
      if (visible) setActive(visible.index);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateFromScroll);
    };
    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    desktop.addEventListener('change', requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      desktop.removeEventListener('change', requestUpdate);
    };
  }, []);

  return <div className="work-interactive">
    <ul className="project-list">
      {projects.map((project, index) => <li key={project.id}><button ref={(node) => { rowRefs.current[index] = node; }} data-project-index={index} type="button" className={`project-row ${active===index?'is-active':''}`} onPointerEnter={(event)=>event.pointerType!=='touch'&&setActive(index)} onFocus={()=>setActive(index)} onClick={()=>setActive(index)} aria-pressed={active===index}>
        <span className="project-index mono">{project.id}</span>
        <span className="project-copy"><span className="project-title">{project.title} <ArrowUpRight aria-hidden="true" /></span><span className="project-category mono">{project.category}</span></span>
        <span className="project-year mono">{project.year}</span>
      </button></li>)}
    </ul>
    <div className="project-preview" aria-live="polite">
      {projects.map((project, index) => <div
        key={project.id}
        className={`preview-inner preview-swap ${active===index?'is-active':''}`}
        data-project-panel={index}
        aria-hidden={active!==index}
        inert={active!==index}
      >
        <div className="preview-head mono"><span>{copy.updatedLabel}</span><span>{project.id} / {String(projects.length).padStart(2, '0')}</span></div>
        <RepositoryVisual project={project} copy={copy} />
        <div className="preview-foot mono"><span>{project.category}</span><a href={project.url} target="_blank" rel="noreferrer">{copy.repositoryLabel} <ArrowUpRight aria-hidden="true" /></a></div>
      </div>)}
    </div>
  </div>;
}
