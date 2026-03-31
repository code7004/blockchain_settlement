import type { SVGProps } from 'react';

const PageLoader = ({ className }: { className: string }) => {
  return (
    <div className={'flex flex-col items-center justify-center flex-1 w-full transition-colors duration-500 bg-liner-to-b from-blue-100 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-black ' + className}>
      {/* 회전하는 로고 아이콘 */}
      <div className="mb-6">
        <LoadingTwotoneLoop className="w-16 h-16 text-gray-600 opacity-90" />
      </div>

      {/* 텍스트 애니메이션 */}
      {/* <div className="flex items-center space-x-1 text-xl font-semibold tracking-wide text-gray-600 dark:text-blue-300">
        <span>페이지를 불러오는 중입니다</span>
        <span className="text-2xl animate-bounce">.</span>
        <span className="animate-bounce [animation-delay:0.2s] text-2xl">.</span>
        <span className="animate-bounce [animation-delay:0.4s] text-2xl">.</span>
      </div> */}
    </div>
  );
};

export default PageLoader;

export function LoadingTwotoneLoop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="10em" height="10em" {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path strokeDasharray="16" strokeDashoffset="16" d="M12 3c4.97 0 9 4.03 9 9">
          <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0"></animate>
          <animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"></animateTransform>
        </path>
        <path strokeDasharray="64" strokeDashoffset="64" strokeOpacity=".3" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
          <animate fill="freeze" attributeName="stroke-dashoffset" dur="1.2s" values="64;0"></animate>
        </path>
      </g>
    </svg>
  );
}
