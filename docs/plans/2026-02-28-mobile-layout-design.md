# Mobile Layout Design - Neon Grid Defense

## Overview

세로 모드(Portrait) 기준 모바일 레이아웃으로 전환. 드래그 앤 드롭 방식의 타워 배치 지원.

## Requirements

- **화면 방향**: 세로 모드 (Portrait)
- **타워 선택**: 하단 고정 바
- **타워 배치**: 드래그 앤 드롭

## Layout Structure

```
┌─────────────────────────┐
│  ❤️ 20   💰 100   📊 0/15  │  ← 컴팩트 HUD (상단)
├─────────────────────────┤
│                         │
│                         │
│      게임 영역          │  ← 터치 영역
│      (Three.js Canvas)  │
│                         │
│                         │
├─────────────────────────┤
│  [▶ START WAVE]         │  ← 웨이브 버튼
├─────────────────────────┤
│  △    ◇    ○    ◎     │  ← 타워 바 (드래그 시작점)
│ PULSE BEAM NOVA FREEZE  │
│  50   100  150   75     │
└─────────────────────────┘
```

## Component Changes

### 1. Top HUD

| 속성 | 현재 (Desktop) | 변경 (Mobile) |
|------|----------------|---------------|
| 배치 | 중앙, gap 30px | 한 줄, space-between |
| 박스 스타일 | 개별 박스 | 투명 배경, 아이콘+숫자 |
| 폰트 크기 | 26px | 18px |
| 패딩 | 12px 28px | 8px 12px |

### 2. Tower Panel

| 속성 | 현재 (Desktop) | 변경 (Mobile) |
|------|----------------|---------------|
| 버튼 크기 | 85x105px | 60x70px |
| 위치 | bottom: 25px | bottom: 0, safe-area 고려 |
| 키보드 힌트 | 표시 (1-4) | 숨김 |
| 터치 | 클릭 선택 | 드래그 시작점 |

### 3. Wave Button

| 속성 | 현재 (Desktop) | 변경 (Mobile) |
|------|----------------|---------------|
| 위치 | 우하단 고정 | 타워 바 위, 전체 너비 |
| 크기 | padding 16px 35px | 전체 너비, height 50px |

### 4. Cell Info Panel

| 속성 | 현재 (Desktop) | 변경 (Mobile) |
|------|----------------|---------------|
| 위치 | 우측 상단 고정 | 하단 슬라이드 시트 |
| 표시 방식 | 항상 표시 | 타워 탭 시 슬라이드 업 |

### 5. Instructions

- 모바일에서 제거 (터치 기반 직관적 조작)

## Drag & Drop Interaction

### Flow

1. **터치 홀드** (200ms): 타워 버튼 터치 유지
2. **드래그 시작**: 고스트 이미지 생성, 원본 버튼 opacity 감소
3. **드래그 중**:
   - 고스트가 손가락 따라 이동
   - 유효한 셀 위: 초록색 하이라이트
   - 무효한 셀 위: 빨간색 하이라이트
4. **드롭**:
   - 유효한 셀: 타워 배치
   - 무효한 위치: 취소, 원상복구

### Touch Events

```javascript
// 필요한 이벤트
touchstart → 드래그 준비 (200ms 타이머)
touchmove → 고스트 이동, 셀 하이라이트
touchend → 배치 또는 취소
touchcancel → 취소
```

### Visual Feedback

- **고스트 이미지**: 반투명 타워 아이콘 (opacity: 0.7)
- **유효 셀**: 녹색 테두리 + 글로우
- **무효 셀**: 빨간색 테두리
- **배치 성공**: 파티클 이펙트 (기존 활용)

## Tower Info Sheet

타워를 탭하면 하단에서 올라오는 시트:

```
┌─────────────────────────┐
│  ═══════════════════    │  ← 드래그 핸들
│  PULSE TOWER     Lv.1   │
│  ─────────────────────  │
│  Damage: 10  Range: 2   │
│  Kills: 0               │
│  ┌─────────┐ ┌────────┐ │
│  │ UPGRADE │ │  SELL  │ │
│  │   75G   │ │  25G   │ │
│  └─────────┘ └────────┘ │
└─────────────────────────┘
```

## CSS Media Query

```css
@media (max-width: 768px) and (orientation: portrait) {
  /* 모바일 세로 모드 스타일 */
}
```

## Safe Area

iOS notch/home indicator 대응:

```css
padding-bottom: env(safe-area-inset-bottom);
```

## Files to Modify

1. `index.html` - CSS 미디어 쿼리 추가, HTML 구조 일부 변경
2. `game.js` - 터치 이벤트 핸들러, 드래그 앤 드롭 로직

## Out of Scope

- 가로 모드 지원
- 태블릿 최적화
- 그리드 크기 변경 (15x10 유지)
