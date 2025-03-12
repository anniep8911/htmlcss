# UI 개발자 면접용 포트폴리오

## **1. 소개**
- **이름:** [이름 입력]
- **직무:** UI 개발자
- **핵심 강점:** SCSS 스타일링, JS 모듈화, 스타일 가이드 제작, 반응형 웹제작, 마이크로 매니징

---

## **2. 핵심 역량**

### 🎯 **SCSS & UI 스타일링**
- SCSS를 활용한 **효율적인 스타일 구조 설계**
- **반복 최소화 & 유지보수성 강화**를 위한 믹스인 활용
- 다양한 프로젝트에서 **재사용 가능한 스타일 시스템 구축 경험**

### 🎯 **JS 모듈화 & 유지보수 최적화**
- **컴포넌트 기반 개발**을 통한 코드 효율성 향상
- jQuery 및 순수 JS 활용한 **재사용 가능한 함수 설계**
- **이벤트 위임 & 모듈 패턴 적용**으로 성능 개선

### 🎯 **마이크로 매니징 & 스니펫 활용**
- UI 개발 최적화를 위한 **코드 스니펫 활용**
- **컴포넌트별 SCSS/JS 구조화**로 유지보수성 강화
- 개발자 & 디자이너 간 협업 시 **협업 효율성 향상 사례 다수 보유**

---

## **3. SCSS 능력 - 대표 믹스인**

### 🔹 **1. 텍스트 말줄임 처리 믹스인**

```scss
// 입력받은 줄 수 기준으로 자동 말줄임 처리
@mixin ellipsis($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// 사용 예시
.text-single-line {
  @include ellipsis(1); // 한 줄 말줄임
}

.text-multi-line {
  @include ellipsis(3); // 세 줄까지 표시 후 말줄임
}
```

✅ 줄 수에 따라 자동으로 ... 처리<br>
✅ 반복적인 스타일 코드를 단순화하여 유지보수성 강화


### 🔹 **2.반응형 믹스인 (디바이스 기준 적용)**
```scss
// 디바이스 타입을 입력하면 해당 조건에 맞는 스타일 적용
@mixin responsive($device) {
  @if $device == "pc" {
    @media (min-width: 1025px) {
      width: 80%;
      max-width: 1080px;
      margin: 0 auto;
      @content;
    }
  } @else if $device == "tab" {
    @media (max-width: 1024px) {
      width: 90%;
      max-width: 1024px;
      margin: 0 auto;
      @content;
    }
  } @else if $device == "mob" {
    @media (max-width: 767px) {
      width: 90%;
      max-width: auto;
      margin: 0 auto;
      @content;
    }
  } @else {
    @warn "🚨 Error: 올바른 디바이스 타입을 입력하세요! (pc, tab, mob 중 선택)";
  }
}

// 사용 예시
.container {
  @include responsive("pc") {
    background-color: lightblue;
  }

  @include responsive("tab") {
    background-color: lightgreen;
  }

  @include responsive("mob") {
    background-color: lightcoral;
  }
}
```
✅ 미디어 쿼리를 직접 쓰지 않고 간결하게 관리 가능<br>
✅ PC, 태블릿, 모바일에 맞춰 자동으로 스타일 적용<br>
✅ 코드 가독성 & 유지보수 편의성 증가<br>

---

## 4. JS 모듈화 능력 - 대표적 함수 재사용 가이드

📌 차트 설정 공통 가이드
차트의 영역 가져오기, 라벨 설정, X축 데이터 적용, 변수 설정 등 공통 요소 정리
유지보수성을 고려하여 재사용 가능한 코드 구조 적용
팀 내 개발자들이 쉽게 참고할 수 있도록 가이드화



___


