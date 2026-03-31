## 1. 목표

- Tron Nile Testnet에서 TRC20(MockUSDT) 컨트랙트 배포
- decimals = 6 설정
- 초기 발행량 생성
- IDE에서 함수 호출 테스트
- 2부 Deposit Watcher 실습 준비 완료

---

## 2. 사전 준비

### 2.1 TronLink 설치

[Chrome 확장 프로그램에서 TronLink 설치](https://chromewebstore.google.com/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec?hl=ko&gl=US)

![](https://velog.velcdn.com/images/code7004/post/39b9b879-28b1-45ad-bfd4-e54ace5a5a59/image.png)

- 지갑 생성
- Mnemonic 백업
- 비밀번호 설정

![](https://velog.velcdn.com/images/code7004/post/6e565730-124c-4809-9ab0-443d9a8d6de7/image.png)

---

### 2.2 네트워크 변경

TronLink 상단 네트워크를
![](https://velog.velcdn.com/images/code7004/post/941b064a-3b8a-4ed6-9414-d0965199ec41/image.png)

```
Nile Testnet
```

으로 변경

---

### 2.3 Nile Faucet에서 TRX 받기

- TronLink 주소 복사
- [Nile Faucet에서 TRX 요청](https://nileex.io/join/getJoinPage)
- 지갑에 TRX 도착 확인

![](https://velog.velcdn.com/images/code7004/post/1440c17a-96d6-462a-802b-0f91b1bb0409/image.png)

---

## 3. Tron IDE 접속

[https://ide.tron.network]() 접속

### 3.1 Workspace 생성

- 새 Workspace 생성
  ![](https://velog.velcdn.com/images/code7004/post/b6ee5d07-1c7e-4a1b-a9c0-19f4d69d3e44/image.png)
  ![](https://velog.velcdn.com/images/code7004/post/caac0e23-04d1-4bd9-ad00-a518c9ea4015/image.png)
- contracts 폴더에 기존 파일 제거
  ![](https://velog.velcdn.com/images/code7004/post/ac02d3e3-911e-4854-8d07-49aa1983d39e/image.png)
- contracts 폴더에 `MockUSDT.sol` 파일 생성

---

## 4. MockUSDT 컨트랙트 코드

```ts
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

---

## 5. Solidity 컴파일

왼쪽 메뉴에서 Solidity 아이콘 클릭

- Compiler Version: 0.8.x
- Compile MockUSDT.sol

컴파일 성공 메시지 확인

> 이미지: Solidity Compiler 성공 화면

---

## 6. Deploy 설정

왼쪽 메뉴 → Deploy & Run Transactions

### 6.1 Environment 설정

```
Injected TronWeb
```

확인

- Network: TRON (nile) network
- Account: TronLink 주소
- TRX 잔액 표시

> 이미지: Deploy & Run 설정 화면

---

### 6.2 initialSupply 입력

![](https://velog.velcdn.com/images/code7004/post/1997e387-d32c-4293-876e-589321c94351/image.png)

Constructor 입력칸에:

```
1000000000000
```

설명:

```
1,000,000 * 10^6
```

(decimals = 6 기준)

---

### 6.3 Deploy 클릭

![](https://velog.velcdn.com/images/code7004/post/24a29537-c0bf-4ee7-a8a1-da33aea5aa5e/image.png)

- TronLink 팝업 확인
- 수수료 승인
- 배포 완료

---

## 7. 배포 확인

![](https://velog.velcdn.com/images/code7004/post/b6332cbf-dc9e-43a9-bbaa-e231c2b85304/image.png)

배포 성공 시:

- Deployed Contracts 영역에 컨트랙트 인스턴스 생성
- Contract Address 표시

이 주소가:

```
CONTRACT_ADDRESS
```

이다.

> 이미지: Deployed Contracts 화면

---

## 8. 함수 테스트

### 8.1 decimals()

결과:

```
6
```

---

### 8.2 totalSupply()

결과:

```
1000000000000
```

---

### 8.3 balanceOf(내 주소)

결과:

```
1000000000000
```

정상적으로 초기 발행량이 내 지갑에 할당되었음을 확인.
![](https://velog.velcdn.com/images/code7004/post/0547f6a4-3b57-413e-9354-7a62f559213f/image.png)

---

## 9. TronLink에 MockUSDT 자산 추가하기

배포한 MockUSDT는 자동으로 자산 목록에 표시되지 않는다.

따라서 TronLink에서 직접 Custom Token으로 추가해야 한다.

---

### 9-1. Custom Token 추가

Assets 화면에서 **추가(+) 버튼** 클릭

![](https://velog.velcdn.com/images/code7004/post/e5bb72a7-53c7-4e96-8f97-0c7b7835e5be/image.png)

`Custom Token` 선택

![](https://velog.velcdn.com/images/code7004/post/8064f4d6-8bf4-43b0-8e20-eb215dea1eb9/image.png)

배포한 Contract Address 입력

- Contract Address: 배포한 MockUSDT 주소
- Network: Nile Testnet

정상이라면 Name / Symbol / Decimals가 자동 로딩된다.

Confirm 클릭

---

### 9-2. 자산 목록 확인

추가 완료 후 Assets 목록에 `mUSDT`가 표시된다.

![](https://velog.velcdn.com/images/code7004/post/78e9bb45-2256-4758-baa3-95764342aeaa/image.png)

잔액은 decimals(6) 기준으로 자동 변환되어 표시된다.

예:

```
1000000000000 → 1,000,000 mUSDT
```

---

### 9-3. mUSDT 전송 테스트

자산 목록에서 `mUSDT` 클릭 후 `Send`

![](https://velog.velcdn.com/images/code7004/post/a788a84a-63c5-4fa2-aab8-c3c605b75459/image.png)

여기서:

- To: Sender 지갑 주소
- Amount: 100 (예시)

전송 시 실제로는 내부적으로:

```
100 * 10^6 = 100000000
```

이 값이 컨트랙트에 전달된다.

---

## 🔎 여기서 중요한 이해

TronLink는 단순 UI일 뿐이다.

실제로 일어나는 일은:

```
transfer(address,uint256)
```

함수가 호출되고

```
Transfer(address indexed from, address indexed to, uint256 value)
```

이벤트가 발생한다.

이 이벤트가 이후 Deposit Watcher에서 사용된다.

## 10. 이번 작업에서 이해한 핵심

- Tron IDE에서 Solidity 배포 흐름
- Injected TronWeb = TronLink 연동
- TRC20 이벤트 구조
- decimals 처리 방식
- initialSupply 계산 방식
- Transfer 이벤트 발생 원리

---

## 11. 다음 단계

- TronWeb로 Contract 연결
- receipt.log 구조 분석
- topics decode 실습
- Mini Deposit Watcher 구현
