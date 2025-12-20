import { cookies } from 'next/headers';
import MonitorLoginForm from '@/components/monitor/MonitorLoginForm';
import MonitorClient from '@/components/monitor/MonitorClient';
import { fetchRecentExams, fetchReportedExams } from '@/app/monitor/actions';
import { MonitorRange } from '@/app/monitor/types';
import { MONITOR_COOKIE } from '@/app/monitor/config';

const DEFAULT_RANGE: MonitorRange = 'today';

export default async function MonitorPage() {
  const cookieStore = await cookies();
  const isAuthorized = cookieStore.get(MONITOR_COOKIE)?.value === 'true';

  if (!isAuthorized) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-start px-4 py-10">
        <MonitorLoginForm />
      </main>
    );
  }

  const [reportedExams, recentExams] = await Promise.all([
    fetchReportedExams(),
    fetchRecentExams(DEFAULT_RANGE),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <MonitorClient
        initialReported={reportedExams}
        initialRecent={recentExams}
        initialRange={DEFAULT_RANGE}
      />
    </main>
  );
}

