import { Suspense } from 'react'
import { getProjects } from '@/lib/projects/actions'
import { ProjectsHeader } from '@/components/projects/projects-header'
import { ProjectsList } from '@/components/projects/projects-list'
import { Skeleton } from '@/components/ui/skeleton'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <ProjectsHeader />
      <Suspense fallback={<ProjectsListSkeleton />}>
        <ProjectsList initialProjects={projects} />
      </Suspense>
    </div>
  )
}

function ProjectsListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48" />
      ))}
    </div>
  )
}
