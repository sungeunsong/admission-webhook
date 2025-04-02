1. generate-certs.sh 파일을 실행해서 tls 생성 및 k8s에 등록
2. validatingwebhookconfiguration의 caBundle 내용 수정 (cat tls.crt | base64 -w 0 으로 인코딩한 tls값으로 수정 )
3. admission~.yaml, service.yaml, validatingwebhookconfiguration의.yaml 적용
4. test-pod.yaml 적용 시도 ()

- admission 적용 삭제시

* kubectl delete validatingwebhookconfiguration validate-label

# Admission Webhook 개요 및 실습 정리

## 어드미션(Admission)이란?

Kubernetes에서 `kube-apiserver`로 들어오는 **모든 리소스 변경 요청(CREATE, UPDATE, DELETE)**에 대해,  
인증(Authentication), 인가(Authorization)을 통과한 후 **추가로 정책을 검사하거나 수정하는 단계**.

어드미션 단계에서 다음을 수행할 수 있다:

- 리소스의 생성/수정 요청을 **거부(deny)**
- 요청 내용을 **자동 수정(mutate)**
- 정책 위반 여부를 **외부 시스템과 연동해 검사**

---

## 어드미션 컨트롤러 종류

### 1. Built-in Admission Controllers (Kubernetes 내장)

Kubernetes에 기본 탑재된 정책 제어 플러그인. 일부 예시는 다음과 같다:

| 이름                 | 설명                                        |
| -------------------- | ------------------------------------------- |
| `NamespaceLifecycle` | 삭제 중인 네임스페이스에 리소스 생성 제한   |
| `LimitRanger`        | CPU/메모리 제한 미지정 시 리소스 거부       |
| `ResourceQuota`      | 네임스페이스당 리소스 할당량 초과 방지      |
| `PodSecurity`        | Pod 수준의 보안 프로필 적용 (restricted 등) |

> ⚠️ 대부분은 `kube-apiserver`의 `--enable-admission-plugins` 옵션으로 활성화 여부가 결정.
```
kube-apiserver \
  --enable-admission-plugins=NamespaceLifecycle,LimitRanger,ServiceAccount,ResourceQuota
```
---

### 2. Webhook Admission Controllers (사용자 정의)

외부 HTTP 서버(Webhook)를 호출하여 정책을 동적으로 검사하거나 요청을 수정할 수 있다.

| 유형                         | 설명            | 주요 목적                       |
| ---------------------------- | --------------- | ------------------------------- |
| `MutatingAdmissionWebhook`   | 요청을 **수정** | 기본 값 삽입, 라벨 자동 추가 등 |
| `ValidatingAdmissionWebhook` | 요청을 **검사** | 조건 위반 시 요청 거부          |

> Kubernetes는 Webhook 서버와 TLS로 통신하며, 서버는 반드시 `AdmissionReview` 형식으로 응답해야 한다.

---

## 🛠️ Webhook에 자주 사용되는 조건 예시

다음은 Webhook을 통해 자주 적용하는 정책 조건들:

| 조건                   | 설명                                      | 예시                             |
| ---------------------- | ----------------------------------------- | -------------------------------- |
| 특정 라벨 필수         | 리소스에 특정 라벨이 없으면 거부          | `metadata.labels.team = dev`     |
| 금지된 이미지 태그     | `latest` 태그 사용 금지                   | `image: nginx:latest` → 거부     |
| privileged 사용 금지   | Pod spec에 privileged 설정 있을 경우 거부 | 보안 정책 적용                   |
| hostPath 사용 제한     | 호스트 볼륨 마운트 제한                   | `hostPath`가 포함되면 거부       |
| 리소스 제한 필수       | CPU/Memory 요청/제한 필수                 | 없으면 거부                      |
| 네임스페이스 기반 제한 | 특정 네임스페이스만 허용                  | `kube-system`에서는 생성 불가 등 |

---

## 📦 실습 예시 요약

- `ValidatingAdmissionWebhook`을 사용해,  
  `team=dev` 라벨이 없는 Pod 생성 요청을 거부하는 웹훅 서버를 구축함
- Node.js + Express로 구현
- Self-signed 인증서를 사용해 TLS 통신 구성

---

## 📝 참고

- Kubernetes 공식 문서: https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/
- AdmissionReview spec: https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#request-and-response-format
