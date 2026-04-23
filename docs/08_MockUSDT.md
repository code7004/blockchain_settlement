# MockUSDT Guide

> 개발/테스트 환경에서 TRC20 흐름을 검증하기 위한 MockUSDT 문서
>
> 운영 환경은 실제 TRC20 USDT를 사용하며, 본 문서는 Dev/Testnet 전용이다.

---

## 1. Purpose

MockUSDT는 실제 자산을 사용하지 않고 다음 흐름을 검증하기 위한 테스트 토큰이다.

- Wallet 주소 발급
- TRC20 Transfer event 발생
- DepositWorker 감지
- Deposit DETECTED 생성
- ConfirmWorker 확정
- Callback 생성/전송
- SweepJob 생성
- SweepWorker token transfer

기본 정책:

- Network: Tron Nile Testnet
- Token name: MockUSDT
- Symbol: mUSDT
- Decimals: 6

---

## 2. System Integration Points

API/Worker가 사용하는 env:

```text
TRON_FULL_HOST
TRONGRID_API_KEY
TRON_USDT_CONTRACT
TOKEN_SYMBOL
HOT_WALLET_ADDRESS
HOT_WALLET_PRIVATE_KEY
GAS_TANK_ADDRESS
GAS_TANK_PRIVATE_KEY
```

MockUSDT 배포 후 반드시 설정할 값:

```text
TOKEN_SYMBOL=mUSDT
TRON_USDT_CONTRACT={MockUSDT contract address}
TRON_FULL_HOST={Nile endpoint}
```

주의:

- Dev 환경의 MockUSDT contract를 Live 환경에 설정하면 안 된다.
- Live 환경의 USDT contract를 Dev 환경에서 테스트 용도로 사용하면 안 된다.
- Phase3 Safety Guard에서 chain/token/env 매핑을 강제해야 한다.

---

## 3. MockUSDT Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockUSDT {
    string public name = "MockUSDT";
    string public symbol = "mUSDT";
    uint8 public decimals = 6;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply;
        emit Transfer(address(0), msg.sender, initialSupply);
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "insufficient balance");
        require(allowance[from][msg.sender] >= value, "not allowed");

        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;

        emit Transfer(from, to, value);
        return true;
    }
}
```

주의:

- 위 코드는 테스트용이다.
- 실제 운영 토큰 대체물이 아니다.
- 배포 전 컴파일 결과를 반드시 확인한다.

---

## 4. Deploy Steps

1. TronLink 설치
2. Nile Testnet 선택
3. Nile Faucet에서 TRX 수령
4. Tron IDE 접속
5. `MockUSDT.sol` 생성
6. Solidity 0.8.x로 compile
7. `Injected TronWeb` 선택
8. constructor `initialSupply` 입력
9. deploy
10. contract address 확인

권장 initialSupply:

```text
1000000000000
```

의미:

```text
1,000,000 * 10^6
```

---

## 5. TronLink Token Registration

배포 후 TronLink에서 Custom Token으로 추가한다.

입력:

- Contract Address: 배포된 MockUSDT 주소
- Network: Nile Testnet

정상 등록 시:

- Name: MockUSDT
- Symbol: mUSDT
- Decimals: 6

---

## 6. Deposit Test Flow

1. Portal 또는 Partner API에서 Wallet 생성
2. 생성된 Deposit Wallet address 확인
3. TronLink에서 mUSDT 전송
4. DepositWorker가 Transfer event 감지
5. DB에 Deposit DETECTED 생성
6. ConfirmWorker가 CONFIRMED 전환
7. CallbackLog 생성
8. SweepJob 생성
9. SweepWorker가 Deposit Wallet -> Hot Wallet 전송
10. ConfirmWorker가 SweepLog CONFIRMED 처리

---

## 7. Amount Conversion

MockUSDT decimals는 6이다.

예:

```text
UI amount: 100 mUSDT
raw amount: 100 * 10^6 = 100000000
```

현재 `TronService.transferToken()`은 token decimals를 조회하고 내부 raw amount를 계산한다.

주의:

- amount precision 정책은 token decimals와 일치해야 한다.
- 운영 USDT도 TRC20 기준 decimals 6이다.

---

## 8. Operational Notes

Dev/Testnet에서 필요한 지갑:

- 테스트 송신 지갑
- Deposit Wallet
- Hot Wallet
- Gas Tank Wallet

각 지갑에 필요한 자산:

- 테스트 송신 지갑: mUSDT, TRX
- Deposit Wallet: mUSDT 입금 후 Sweep 전 TRX 필요
- Hot Wallet: sweep 수신
- Gas Tank Wallet: refill용 TRX

---

## 9. Troubleshooting

Deposit이 감지되지 않는 경우:

- `TRON_USDT_CONTRACT`가 배포 contract와 일치하는지 확인
- `TRON_FULL_HOST`가 Nile endpoint인지 확인
- Transfer event가 실제 발생했는지 확인
- DepositWorker log 확인
- `runtime/watcher-state.json` cursor 확인

Sweep이 실패하는 경우:

- Deposit Wallet TRX balance 확인
- Gas Tank TRX balance 확인
- HOT_WALLET_ADDRESS 확인
- TRON_USDT_CONTRACT 확인
- SweepLog status/reason 확인

Callback이 실패하는 경우:

- partner callbackUrl 확인
- callbackSecret 확인
- partner endpoint 응답 코드 확인
- CallbackLog attemptCount/status 확인
