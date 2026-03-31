# Source Tree

## apps/admin

```
admin
├───app
│       App.tsx
│       main.tsx
│       RouteData.tsx
│
├───components
│       MarkDownViewer.tsx
│       TxDropdownPartners.tsx
│
├───core
│   │   extensions.ts
│   │
│   ├───route-meta
│   │       hooks.ts
│   │       index.ts
│   │       renderer.ts
│   │       types.ts
│   │       utils.ts
│   │
│   └───tx-ui
│       │   index.ts
│       │   tx-ui.utils.ts
│       │
│       ├───TxButton
│       │       index.tsx
│       │       TxButton.theme.ts
│       │
│       ├───TxCoolTable
│       │       index.ts
│       │       TxCoolTable.theme.ts
│       │       TxCoolTable.tsx
│       │       TxCoolTable.types.ts
│       │       TxCoolTable.utils.ts
│       │       TxCoolTablePagenation.tsx
│       │       TxCoolTableScroller.tsx
│       │
│       ├───TxDropdown
│       │       index.ts
│       │       txdropdown.theme.ts
│       │       TxDropdown.tsx
│       │       txdropdown.types.ts
│       │       TxDropdownBase.tsx
│       │       TxDropdownMulti.tsx
│       │       TxFieldDropdownMulti.tsx
│       │       TxFieldDropdwon.tsx
│       │       utils.ts
│       │
│       ├───TxField
│       │       index.ts
│       │       TxField.theme.ts
│       │       TxField.tsx
│       │       TxField.types.ts
│       │
│       ├───TxIcons
│       │       index.tsx
│       │
│       ├───TxInput
│       │       index.ts
│       │       TxFieldInput.tsx
│       │       TxInput.theme.ts
│       │       TxInput.tsx
│       │       TxInput.types.ts
│       │       TxSearchInput.tsx
│       │
│       ├───TxJsonTree
│       │       index.ts
│       │       TxJsonTree.theme.ts
│       │       TxJsonTree.tsx
│       │       TxJsonTree.types.ts
│       │       TxJsonTree.utils.ts
│       │
│       ├───TxSpinner
│       │       index.tsx
│       │
│       ├───TxTheme
│       │       index.ts
│       │       TxThemeProvider.tsx
│       │
│       └───TxToolTip
│               index.ts
│               TxToolTip.tsx
│
├───docs
│       apiGuide.md
│       Architecture.md
│       DataFlow.md
│       datamodel.md
│       domains.md
│       Overview.md
│       security.md
│
├───domains
│   │   BalancePage.tsx
│   │   CallbackList.tsx
│   │   Dashboard.tsx
│   │   DepositList.tsx
│   │   PartnerList.tsx
│   │   UserList.tsx
│   │   WalletList.tsx
│   │   WithdrawalList.tsx
│   │
│   ├───blockchain
│   │       ThotPage.tsx
│   │       WatcherStatusPage.tsx
│   │
│   ├───documents
│   │       DocApiPage.tsx
│   │       DocApiReference.tsx
│   │
│   └───system
│           ErrorReportPage.tsx
│
├───layouts
│       PageLoader.tsx
│       Sidebar.tsx
│       SidebarItem.tsx
│       Topbar.tsx
│
├───lib
│       api.ts
│       api.types.ts
│       axiosLogger.ts
│       bodyStyles.ts
│       defaultBodyRenderer.tsx
│
├───pagas
│       LoginPage.tsx
│       MainLayout.tsx
│       NotFoundPage.tsx
│
└───styles
        index.css
        tailwind.css
```

---

## apps/api

```
api
│   app.controller.spec.ts
│   app.controller.ts
│   app.module.ts
│   app.service.ts
│   main.ts
│
├───core
│   ├───constants
│   │       index.ts
│   │
│   ├───crypto
│   │       aes256.ts
│   │
│   ├───dto
│   │       pagination.query.dto.ts
│   │
│   ├───errors
│   │       api-exception.filter.ts
│   │       prisma-exception.mapper.ts
│   │
│   ├───logger
│   │       http-logging.interceptor.ts
│   │       logger.constants.ts
│   │       logger.module.ts
│   │       logger.service.ts
│   │
│   └───utils
│           common.ts
│           token.util.ts
│
├───domains
│   ├───admin
│   │   └───partner
│   │       │   admin-partner.controller.ts
│   │       │   admin-partner.module.ts
│   │       │   admin-partner.repository.ts
│   │       │   admin-partner.service.ts
│   │       │
│   │       └───dto
│   │               admin-partner-create-apikey.dto.ts
│   │
│   ├───auth
│   │   │   auth.controller.ts
│   │   │   auth.module.ts
│   │   │   auth.service.ts
│   │   │
│   │   ├───dto
│   │   │       auth-login.dto.ts
│   │   │
│   │   ├───guards
│   │   │       api-key.guard.ts
│   │   │       jwt-auth.guard.ts
│   │   │
│   │   └───strategies
│   │           jwt.strategy.ts
│   │
│   ├───balance
│   │   │   balance.controller.ts
│   │   │   balance.module.ts
│   │   │   balance.repository.ts
│   │   │   balance.service.ts
│   │   │   balance.types.ts
│   │   │
│   │   └───dto
│   │           get-balance.dto.ts
│   │
│   ├───callback
│   │   │   callback.controller.ts
│   │   │   callback.moudle.ts
│   │   │   callback.repository.ts
│   │   │   callback.service.ts
│   │   │   callback.types.ts
│   │   │
│   │   └───dto
│   │           get-callback.query.dto.ts
│   │
│   ├───callback-test
│   │   │   callback-test.controller.ts
│   │   │   callback-test.module.ts
│   │   │   callback-test.service.ts
│   │   │
│   │   └───dto
│   │           get-callback-test.query.dto.ts
│   │
│   ├───deposit
│   │   │   confirm.service.ts
│   │   │   deposit.controller.ts
│   │   │   deposit.module.ts
│   │   │   deposit.repository.ts
│   │   │   deposit.service.ts
│   │   │   deposit.types.ts
│   │   │   deposit.watcher.ts
│   │   │
│   │   └───dto
│   │           get-deposits.query.dto.ts
│   │
│   ├───health
│   │       health.controller.spec.ts
│   │       health.controller.ts
│   │       health.module.ts
│   │       health.service.spec.ts
│   │       health.service.ts
│   │
│   ├───partner
│   │   │   partner.controller.ts
│   │   │   partner.module.ts
│   │   │   partner.service.ts
│   │   │
│   │   └───dto
│   │           create-partner.dto.ts
│   │           get-partners.query.dto.ts
│   │           update-partner.dto.ts
│   │
│   ├───sweep
│   │       sweep.module.ts
│   │       sweep.service.ts
│   │       sweep.worker.ts
│   │
│   ├───user
│   │   │   user.controller.ts
│   │   │   user.module.ts
│   │   │   user.service.ts
│   │   │
│   │   └───dto
│   │           create-user.dto.ts
│   │           get-users.query.dto.ts
│   │           update-user.dto.ts
│   │
│   ├───wallet
│   │   │   gas-refill.worker.ts
│   │   │   wallet.controller.spec.ts
│   │   │   wallet.controller.ts
│   │   │   wallet.module.ts
│   │   │   wallet.repository.ts
│   │   │   wallet.service.spec.ts
│   │   │   wallet.service.ts
│   │   │
│   │   └───dto
│   │           create-wallet.dto.ts
│   │           get-wallets.query.dto.ts
│   │
│   └───withdrawal
│       │   withdrawal.controller.ts
│       │   withdrawal.module.ts
│       │   withdrawal.repository.ts
│       │   withdrawal.service.ts
│       │
│       └───dto
│               create-withdrawal.dto.ts
│               get-withdrawals.query.dto.ts
│
├───infra
│   └───tron
│           tron.client.ts
│           tron.module.ts
│           tron.service.ts
│
└───prisma
        prisma.module.ts
        prisma.service.ts
```
