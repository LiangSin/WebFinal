import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { MONITOR_COOKIE } from '@/app/monitor/config';
import { getExamForAdmin } from '@/app/monitor/actions';
import AdminExamEditor from '@/components/monitor/AdminExamEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MonitorExamEditPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const isAuthorized = cookieStore.get(MONITOR_COOKIE)?.value === 'true';
  if (!isAuthorized) {
    redirect('/monitor');
  }

  const { id } = await params;
  const exam = await getExamForAdmin(id);
  if (!exam) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <AdminExamEditor exam={exam} />
    </main>
  );
}

