import type { TxLoadingProps } from '.';

export const TxLoading = ({ visible = true, text, className = '', fullScreen = false }: TxLoadingProps) => {
  const isShow = visible === true || (Array.isArray(visible) && visible.length === 0) || text != undefined || text != null;

  if (!isShow) return null;

  return !fullScreen ? (
    <div data-tag="TxLoading" className={`flex flex-col justify-center items-center ${className}`}>
      <Dots />
      {typeof visible === 'string' && <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">{text}</div>}
    </div>
  ) : (
    <div data-tag="TxLoading" className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* 배경 오버레이만 따로 */}
      <div className="absolute inset-0 bg-black opacity-20 dark:bg-white" />
      {/* 컨텐츠 */}
      <Dots />
      {typeof visible === 'string' && <div className="mt-4 font-bold text-black dark:text-white">{text}</div>}
    </div>
  );
};

const Dots = () => (
  <div className="z-50 flex space-x-2">
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="w-2 h-2 bg-gray-600 rounded-full dark:bg-gray-300 animate-bounce" style={{ animationDelay: `${i * 0.08}s` }} />
    ))}
  </div>
);
