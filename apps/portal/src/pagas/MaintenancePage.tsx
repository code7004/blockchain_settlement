import { elapsedTimeToLabel } from '@/core/extensions';
import { useEffect, useState } from 'react';

const Locale: Record<string, string> = { month: '월', day: '일', hour: '시간', minute: '분', second: '초' };

export const MaintenancePage = ({ message = '' }: { message?: string }) => {
  const [count, setCount] = useState(60 * 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      location.reload();
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center max-w-sm p-8 bg-white rounded-xl shadow-lg animate-fadeIn">
        <div className="text-5xl mb-4 animate-bounce">🚧</div>

        <h1 className="text-xl mb-2">{message} 서비스 점검중입니다</h1>

        <p className="text-sm mb-4 leading-relaxed">
          현재 안정적인 서비스 제공을 위해
          <br />
          시스템 점검을 진행하고 있습니다.
          <br />
          잠시만 기다려 주세요.
        </p>

        <div className="text-gray-500 text-sm">{elapsedTimeToLabel(count, 2, (k: string) => Locale[k] ?? k)} 후 자동 새로고침</div>
      </div>
    </div>
  );
};
