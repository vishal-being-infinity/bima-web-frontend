import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getMyHistory, type HistoryResult } from '../api/quiz';
import { PageSpinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { Trophy, BarChart2 } from 'lucide-react';

function formatDate(str: string) {
  const d = new Date(str);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${h}:${m} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
}

function rankColor(rank: number | null) {
  if (rank === 1) return '#FFD166';
  if (rank === 2) return '#BDBDBD';
  if (rank === 3) return '#CD7F32';
  return '#6C8EFF';
}

function HistoryCard({ result }: { result: HistoryResult }) {
  const color = rankColor(result.rank);
  // Rank percentile: how far from last place (lower rank number = better)
  const rankPct =
    result.rank != null && result.totalParticipants > 1
      ? Math.round(((result.totalParticipants - result.rank) / (result.totalParticipants - 1)) * 100)
      : 0;

  return (
    <div className="bg-white dark:bg-[#1A1D24] rounded-[20px] border border-black/5 dark:border-white/[0.06] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-[#0C0E14] dark:text-white leading-tight truncate mb-1">
            {result.title}
          </p>
          <p className="text-[12px] text-[#6B7280] dark:text-[#7A8499]">{formatDate(result.completedAt)}</p>
        </div>
        <div
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm border-[1.5px]"
          style={{ color, borderColor: `${color}40`, backgroundColor: `${color}18` }}
        >
          {result.rank == null ? '—' : `#${result.rank}`}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[11px] font-semibold text-[#6B7280] dark:text-[#7A8499] mb-0.5">Score</p>
          <p className="text-[14px] font-bold text-[#0C0E14] dark:text-white">{result.score} pts</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#6B7280] dark:text-[#7A8499] mb-0.5">Questions</p>
          <p className="text-[14px] font-bold text-[#0C0E14] dark:text-white">{result.totalQuestions}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#6B7280] dark:text-[#7A8499] mb-0.5">Players</p>
          <p className="text-[14px] font-bold text-[#0C0E14] dark:text-white">{result.totalParticipants}</p>
        </div>
      </div>

      {/* Rank percentile bar */}
      {result.rank != null && (
        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-semibold mb-1.5 text-[#6B7280] dark:text-[#7A8499]">
            <span>Rank percentile</span>
            <span>Top {100 - rankPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#F3F4F6] dark:bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${rankPct}%`, backgroundColor: color }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['history'],
    queryFn: ({ pageParam = 1 }) => getMyHistory(pageParam as number, 10),
    getNextPageParam: (last) => last.pagination.hasMore ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const results = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="min-h-full bg-gradient-to-br from-[#F8F9FC] to-[#F2F4F9] dark:from-[#0F1117] dark:to-[#161B22]">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-5 h-5 text-[#4F7A00] dark:text-[#B5E82C]" />
          <h1 className="text-xl font-extrabold text-[#0C0E14] dark:text-white tracking-tight">Quiz History</h1>
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : results.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1D24] rounded-[20px] border border-black/[0.05] dark:border-white/[0.06] p-10 flex flex-col items-center gap-3 text-[#9CA3AF] dark:text-[#4A5568]">
            <Trophy className="w-10 h-10" />
            <p className="text-sm text-center">No quiz history yet. Play your first quiz!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {results.map((r) => <HistoryCard key={`${r.quizId}-${r.completedAt}`} result={r} />)}
            {hasNextPage && (
              <Button
                variant="ghost"
                fullWidth
                loading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                Load more
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
