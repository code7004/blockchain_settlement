// src/app/RouteData.tsx
import type { RouteTree } from '@/core/route-meta';

// Layout
import MainPage from '@/pagas/MainPage';

// Pages
import BalancePage from '@/domains/balance/BalancePage';
import ThotPage from '@/domains/blockchain/ThotPage';
import WatcherStatusPage from '@/domains/blockchain/WatcherStatusPage';
import AdminMemberList from '@/domains/member/AdminMemberList';
import AdminPartnerList from '@/domains/partner/AdminPartnerList';
import PublicPartnerList from '@/domains/partner/PublicPartnerList';
import WithdrawalList from '@/domains/withdrawall/WithdrawalList';

import MarkDownViewer from '@/components/MarkDownViewer';
import AdminCallbackList from '@/domains/callback/AdminCallbackList';
import PublicCallbackList from '@/domains/callback/PublicCallbackList';
import PublicDashboard from '@/domains/dashboard/PublicDashboard';
import AdminDepositList from '@/domains/deposit/AdminDepositList';
import PublicDepositList from '@/domains/deposit/PublicDepositList';
import DevConsolePage from '@/domains/devconsole/DevConsolePage';
import { MemberRole } from '@/domains/member/member.api';
import SwaggerPage from '@/domains/swgger/SwaggerPage';
import ErrorReportPage from '@/domains/system/ErrorReportPage';
import AdminUserList from '@/domains/user/AdminUserList';
import PublicUserList from '@/domains/user/PublicUserList';
import AdminWalletList from '@/domains/wallet/AdminWalletList';
import PublicWalletList from '@/domains/wallet/PublicWalletList';
import LoginPage from '@/pagas/LoginPage';
import NotFoundPage from '@/pagas/NotFoundPage';
import { Navigate, Outlet } from 'react-router-dom';

const { OWNER, OPERATOR, DEVELOPER } = MemberRole;

export const RouteData = {
  LoginPage: { path: '/login', element: <LoginPage />, meta: { label: 'Login', icon: '🔐', description: '관리자 인증 및 운영 시스템 진입 페이지', hidden: true } },
  DeveloperPage: {
    path: '/',
    element: <MainPage />,
    meta: { label: 'Main', icon: '🧭', description: '멀티 파트너 블록체인 정산 Developer 메인 레이아웃', hidden: true, permissions: [OWNER, OPERATOR, DEVELOPER] },
    children: {
      Index: { index: true, element: <Navigate to="/dashboard" replace /> },
      Dashboard: {
        path: '/dashboard',
        element: <PublicDashboard />,
        meta: { label: 'Dashboard', icon: '📊', description: '입금,출금,콜백,워처 상태 등 운영 핵심 지표를 한눈에 확인하는 대시보드', permissions: [OWNER, OPERATOR, DEVELOPER] },
      },
      PublicPartnerList: {
        path: '/partners',
        element: <PublicPartnerList />,
        meta: { label: 'Partners', icon: '🏢', description: '파트너 목록 조회 및 콜백 URL,활성 상태 등 파트너 운영 정보를 관리', permissions: [OWNER, OPERATOR, DEVELOPER] },
      },
      PublicUserList: { path: '/users', element: <PublicUserList />, meta: { label: 'Users', icon: '👤', description: '파트너 소속 유저 목록 조회 및 외부 사용자 식별값 기준 관리', permissions: [OWNER, OPERATOR, DEVELOPER] } },
      PublicWalletList: { path: '/wallets', element: <PublicWalletList />, meta: { label: 'Wallets', icon: '💼', description: '입금 식별용 지갑 주소와 상태를 조회하고 지갑별 정산 흐름을 추적', permissions: [OWNER, OPERATOR, DEVELOPER] } },
      PublicDeposits: {
        path: '/deposits',
        element: <PublicDepositList />,
        meta: { label: 'Deposits', icon: '⬇️', description: '체인에서 감지된 입금 내역을 조회하고 DETECTED / CONFIRMED 상태를 추적', permissions: [OWNER, OPERATOR, DEVELOPER] },
      },
      PublicCallbacks: {
        path: '/callbacks',
        element: <PublicCallbackList />,
        meta: { label: 'Callbacks', icon: '🔁', description: '파트너 콜백 전송 결과,재시도 횟수,응답 코드 및 실패 상태를 확인', permissions: [OWNER, OPERATOR, DEVELOPER] },
      },
      Documents: {
        path: 'documents',
        meta: { label: 'Documents', icon: '📚', description: 'Swagger 및 내부 API 문서 등 운영 참고 문서', permissions: [OWNER, OPERATOR, DEVELOPER] },
        children: {
          ApiGuide: { path: '/documents/api-guide', element: <MarkDownViewer docKey="apiguide" />, meta: { label: 'API Guide', icon: '📝', description: 'API 요청/응답 및 사용 가이드', permissions: [OWNER, OPERATOR, DEVELOPER] } },
          DocApiSwagger: {
            path: '/documents/api-swagger',
            element: <SwaggerPage path="/docs/api" />,
            meta: { label: 'API Swagger', icon: '📘', description: '백엔드 Swagger 문서', permissions: [OWNER, OPERATOR, DEVELOPER] },
          },
          DataModel: { path: '/documents/dataModel', element: <MarkDownViewer docKey="datamodel" />, meta: { label: 'Data Model', icon: '📝', description: '스키마', permissions: [OWNER, OPERATOR, DEVELOPER] } },
          Consoel: { path: '/documents/console', element: <DevConsolePage />, meta: { label: 'Dev Console', icon: '📝', description: '스키마', permissions: [OWNER, OPERATOR, DEVELOPER] } },
        },
      },
      System: {
        path: '/documents/system',
        element: <Outlet />,
        meta: { label: 'System', icon: '⚙️', description: '아키텍처 및 개발 문서', permissions: [OWNER, OPERATOR, DEVELOPER] },
        children: {
          Overview: {
            path: '/documents/system/overview',
            element: <MarkDownViewer docKey="overview" />,
            meta: { label: 'Overview', icon: '🔥', description: '프로젝트 개요 및 목표', permissions: [OWNER, OPERATOR, DEVELOPER] },
          },
          Architecture: {
            enabled: false,
            path: '/documents/system/architecture',
            element: <MarkDownViewer docKey="architecture" />,
            meta: { label: 'Architecture', icon: '🏗️', description: '시스템 아키텍처 구조', permissions: [OWNER, OPERATOR, DEVELOPER] },
          },
          DataFlow: {
            path: '/documents/system/flow',
            element: <MarkDownViewer docKey="dataflow" />,
            meta: { label: 'Data Flow', icon: '🔄', description: '입금 → 정산 흐름', permissions: [OWNER, OPERATOR, DEVELOPER] },
          },
          Domains: {
            enabled: false,
            path: '/documents/system/domains',
            element: <MarkDownViewer docKey="domains" />,
            meta: { label: 'Domains', icon: '🧱', description: '도메인 구조 설명', permissions: [OWNER, OPERATOR, DEVELOPER] },
          },
          Security: { path: '/documents/system/security', element: <MarkDownViewer docKey="security" />, meta: { label: 'Security', icon: '🔐', description: '보안 정책 및 키 관리', permissions: [OWNER, OPERATOR, DEVELOPER] } },
        },
      },
      Demo: {
        enabled: false,
        path: 'demo',
        meta: { label: 'Demo', icon: '🧪', description: '시스템 테스트 및 검증', permissions: [OWNER, OPERATOR, DEVELOPER] },
        children: {
          DepositTest: { path: '/demo/deposit-test', element: <div>Deposit Test</div>, meta: { label: 'Deposit Test', icon: '🧪', description: '테스트 계정으로 입금 흐름 검증', permissions: [OWNER, OPERATOR, DEVELOPER] } },
        },
      },
    },
  },
  AdminPage: {
    path: '/admin',
    element: <MainPage />,
    meta: { label: 'Main', icon: '🧭', description: '멀티 파트너 블록체인 정산 Admin 메인 레이아웃', hidden: true, permissions: [OWNER, OPERATOR] },
    children: {
      Index: { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      Dashboard: {
        path: '/admin/dashboard',
        element: <PublicDashboard />,
        meta: { label: 'Dashboard', icon: '📊', description: '입금,출금,콜백,워처 상태 등 운영 핵심 지표를 한눈에 확인하는 대시보드', permissions: [OWNER, OPERATOR] },
      },
      Members: {
        path: '/admin/members',
        element: <AdminMemberList />,
        meta: { label: 'Members', icon: '🏢', description: '개발자 목록 조회 및 콜백 URL,활성 상태 등 개발자 운영 정보를 관리', permissions: [OWNER] },
      },
      Partners: { path: '/admin/partners', element: <AdminPartnerList />, meta: { label: 'Partners', icon: '🏢', description: '파트너 목록 조회 및 콜백 URL,활성 상태 등 파트너 운영 정보를 관리', permissions: [OWNER, OPERATOR] } },
      // PartnerDetail: {
      //   path: 'partners/:id',
      //   element: <PartnerDetail />,
      //   meta: { label: 'Partner Detail', icon: '🏢', description: '선택한 파트너의 상세 정보,소속 유저,최근 정산 내역을 확인', hidden: true, permissions: [OWNER, OPERATOR] },
      // },
      AdminUserList: { path: '/admin/users', element: <AdminUserList />, meta: { label: 'Users', icon: '👤', description: '파트너 소속 유저 목록 조회 및 외부 사용자 식별값 기준 관리', permissions: [OWNER, OPERATOR] } },
      AdminWallets: { path: '/admin/wallets', element: <AdminWalletList />, meta: { label: 'Wallets', icon: '💼', description: '입금 식별용 지갑 주소와 상태를 조회하고 지갑별 정산 흐름을 추적', permissions: [OWNER, OPERATOR] } },
      Deposits: {
        path: '/admin/deposits',
        element: <AdminDepositList />,
        meta: { label: 'Deposits', icon: '⬇️', description: '체인에서 감지된 입금 내역을 조회하고 DETECTED / CONFIRMED 상태를 추적', permissions: [OWNER, OPERATOR] },
      },
      Withdrawals: {
        enabled: false,
        path: '/admin/withdrawals',
        element: <WithdrawalList />,
        meta: { label: 'Withdrawals', icon: '⬆️', description: '출금 요청,승인,브로드캐스트 상태를 조회하고 운영 승인 절차를 관리', permissions: [OWNER, OPERATOR] },
      },
      Balances: {
        enabled: false,
        path: '/admin/balances',
        element: <BalancePage />,
        meta: { label: 'Balances', icon: '🧮', description: '확정 입금과 브로드캐스트 출금을 기준으로 계산된 잔액을 조회', permissions: [OWNER, OPERATOR] },
      },
      Callbacks: {
        path: '/admin/callbacks',
        element: <AdminCallbackList />,
        meta: { label: 'Callbacks', icon: '🔁', description: '파트너 콜백 전송 결과,재시도 횟수,응답 코드 및 실패 상태를 확인', permissions: [OWNER, OPERATOR] },
      },
      Blockchain: {
        enabled: false,
        path: '/admin/blockchain',
        meta: { label: 'Blockchain', icon: '⛓️', description: '핫월렛과 워처 상태 등 블록체인 운영 관련 화면을 모아둔 메뉴 그룹', permissions: [OWNER, OPERATOR] },
        children: {
          Thot: { path: '/admin/blockchain/thot', element: <ThotPage />, meta: { label: 'THOT Wallet', icon: '🔥', description: '중앙 Hot Wallet 주소,자산 잔액,운영 상태를 조회하고 관리', permissions: [OWNER, OPERATOR] } },
          Watcher: {
            path: '/admin/blockchain/watcher',
            element: <WatcherStatusPage />,
            meta: { label: 'Watcher Status', icon: '👀', description: '블록 스캔 워처의 lastScannedBlock,lag,동작 여부를 모니터링', permissions: [OWNER, OPERATOR] },
          },
        },
      },
      Documents: {
        path: '/admin/documents',
        meta: { label: 'Documents', icon: '📚', description: 'Swagger 및 내부 API 문서 등 운영 참고 문서', permissions: [OWNER, OPERATOR] },
        children: {
          DocApiSwagger: {
            path: '/admin/documents/api-swagger',
            element: <SwaggerPage path="/docs/partner" />,
            meta: { label: 'Admin API Swagger', icon: '📘', description: '백엔드 Swagger 문서', permissions: [OWNER, OPERATOR] },
          },
          DataModel: { path: '/admin/documents/dataModel', element: <MarkDownViewer docKey="datamodel" />, meta: { label: 'Data Model', icon: '📝', description: '스키마', permissions: [OWNER, OPERATOR] } },
          System: {
            path: '/admin/documents/system',
            element: <Outlet />,
            meta: { label: 'System', icon: '⚙️', description: '아키텍처 및 개발 문서', permissions: [OWNER, OPERATOR] },
            children: {
              Overview: {
                path: '/admin/documents/system/overview',
                element: <MarkDownViewer docKey="overview" />,
                meta: { label: 'Overview', icon: '🔥', description: '프로젝트 개요 및 목표', permissions: [OWNER, OPERATOR] },
              },
              Architecture: {
                path: '/admin/documents/system/architecture',
                element: <MarkDownViewer docKey="architecture" />,
                meta: { label: 'Architecture', icon: '🏗️', description: '시스템 아키텍처 구조', permissions: [OWNER, OPERATOR] },
              },
              DataFlow: {
                path: '/admin/documents/system/flow',
                element: <MarkDownViewer docKey="dataflow" />,
                meta: { label: 'Data Flow', icon: '🔄', description: '입금 → 정산 흐름', permissions: [OWNER, OPERATOR] },
              },
              Domains: {
                path: '/admin/documents/system/domains',
                element: <MarkDownViewer docKey="domains" />,
                meta: { label: 'Domains', icon: '🧱', description: '도메인 구조 설명', permissions: [OWNER, OPERATOR] },
              },
              Security: { path: '/admin/documents/system/security', element: <MarkDownViewer docKey="security" />, meta: { label: 'Security', icon: '🔐', description: '보안 정책 및 키 관리', permissions: [OWNER, OPERATOR] } },
            },
          },
        },
      },
      System: {
        path: '/admin/system',
        meta: { label: 'System', icon: '⚙️', description: '에러 리포트,시스템 모니터링,감사 로그 등 운영 시스템 관리 메뉴 그룹', permissions: [OWNER, OPERATOR] },
        children: {
          Errors: { path: '/admin/system/errors', element: <ErrorReportPage />, meta: { label: 'Error Reports', icon: '🚨', description: '애플리케이션 에러,장애 징후,실패 요청 내역을 조회', permissions: [OWNER, OPERATOR] } },
          Monitoring: {
            path: '/admin/system/monitoring',
            element: <div>System Monitoring</div>,
            meta: { label: 'System Monitoring', icon: '📈', description: 'API,DB,워처,콜백 실패율 등 시스템 전반 상태를 모니터링', permissions: [OWNER, OPERATOR] },
          },
          AuditLogs: {
            path: '/admin/system/audit-logs',
            element: <div>Audit Logs</div>,
            meta: { label: 'Audit Logs', icon: '📜', description: '로그인,설정 변경,출금 승인 등 관리자 행위를 추적하는 감사 로그', permissions: [OWNER, OPERATOR] },
          },
        },
      },
    },
  },
  NotFoundPage: { path: '*', element: <NotFoundPage />, meta: { label: 'Not Found', icon: '❓', description: '존재하지 않는 경로 접근 시 표시되는 예외 페이지', hidden: true } },
} satisfies RouteTree;
