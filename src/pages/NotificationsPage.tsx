import { useQuery } from '@tanstack/react-query';
import { getNotifications, type NotificationItem } from '../api/notifications';
import { PageSpinner } from '../components/ui/Spinner';
import { Bell, Trophy, Megaphone, Zap } from 'lucide-react';

const TYPE_CONFIG = {
  QUIZ: { color: '#C8FF57', icon: Zap, label: 'Quiz' },
  RESULT: { color: '#FFD166', icon: Trophy, label: 'Result' },
  CONTEST: { color: '#FF6B6B', icon: Zap, label: 'Contest' },
  ANNOUNCEMENT: { color: '#6C8EFF', icon: Megaphone, label: 'Announcement' },
};

function formatRelative(str: string) {
  const diff = Date.now() - new Date(str).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotifCard({ item }: { item: NotificationItem }) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.ANNOUNCEMENT;
  const Icon = cfg.icon;

  return (
    <div className={`bg-white dark:bg-[#1A1D24] rounded-[18px] border p-4 flex gap-3 ${!item.read ? 'border-[#B5E82C]/20' : 'border-black/[0.05] dark:border-white/[0.06]'}`}>
      <div
        className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
        style={{ backgroundColor: `${cfg.color}1F` }}
      >
        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[14px] font-bold text-[#0C0E14] dark:text-white leading-tight ${!item.read ? '' : 'opacity-80'}`}>
            {item.title}
          </p>
          <span className="text-[11px] text-[#9CA3AF] shrink-0">{formatRelative(item.createdAt)}</span>
        </div>
        <p className="text-[13px] text-[#6B7280] dark:text-[#7A8499] mt-0.5 leading-snug">{item.body}</p>
      </div>
      {!item.read && (
        <div className="w-2 h-2 rounded-full bg-[#B5E82C] shrink-0 mt-1.5" />
      )}
    </div>
  );
}

export function NotificationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(1, 50),
  });

  const items = data?.data ?? [];

  return (
    <div className="min-h-full bg-gradient-to-br from-[#F8F9FC] to-[#F2F4F9] dark:from-[#0F1117] dark:to-[#161B22]">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-[#4F7A00] dark:text-[#B5E82C]" />
          <h1 className="text-xl font-extrabold text-[#0C0E14] dark:text-white tracking-tight">Notifications</h1>
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1D24] rounded-[20px] border border-black/[0.05] dark:border-white/[0.06] p-10 flex flex-col items-center gap-3 text-[#9CA3AF] dark:text-[#4A5568]">
            <Bell className="w-10 h-10" />
            <p className="text-sm text-center">No notifications yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((n) => <NotifCard key={n.id} item={n} />)}
          </div>
        )}
      </div>
    </div>
  );
}
