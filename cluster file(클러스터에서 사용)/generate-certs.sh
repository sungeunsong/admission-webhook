#!/bin/bash

SERVICE_NAME=webhook
NAMESPACE=default
TMPDIR=$(mktemp -d)

# 인증서 생성
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout ${TMPDIR}/tls.key -out ${TMPDIR}/tls.crt \
  -subj "/CN=${SERVICE_NAME}.${NAMESPACE}.svc"

# Secret 생성
kubectl create secret tls webhook-server-cert \
  --cert=${TMPDIR}/tls.crt --key=${TMPDIR}/tls.key \
  -n ${NAMESPACE}

# 인증서 복사해두기
cp ${TMPDIR}/tls.crt ~/admission/tls.crt

echo "✅ Secret created, tls.crt copied to ./tls.crt"
echo "📌 You can now run: cat tls.crt | base64 -w 0"

