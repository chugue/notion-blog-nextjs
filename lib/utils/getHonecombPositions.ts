export const getHoneycombPositions = (totalItems: number) => {
  const positions: { x: number; y: number; row: number; col: number }[] = [];
  const radius = 48;
  // 육각형 허니콤 패턴을 위한 정확한 계산
  const horizontalSpacing = radius * Math.sqrt(3) + 6; // 👈 수학적 공식
  const verticalSpacing = radius * 1.5 + 4;

  const firstRow: number[] = []; // 1열 (row 0)
  const secondRow: number[] = []; // 2열 (row 1)
  const thirdRow: number[] = []; // 3열 (row 2)

  for (let i = 0; i < totalItems; i++) {
    const remainder = i % 3;

    if (remainder === 0) {
      secondRow.push(i); // 2열에 배치
    } else if (remainder === 1) {
      firstRow.push(i); // 1열에 배치
    } else {
      thirdRow.push(i); // 3열에 배치
    }
  }

  // 각 행의 아이템들을 positions에 추가
  const addRowPositions = (rowItems: number[], rowIndex: number, offsetX: number) => {
    rowItems.forEach((itemIndex, colIndex) => {
      positions[itemIndex] = {
        x: colIndex * horizontalSpacing + offsetX,
        y: rowIndex * verticalSpacing,
        row: rowIndex,
        col: colIndex,
      };
    });
  };

  // 각 행별로 위치 계산
  addRowPositions(firstRow, 0, horizontalSpacing / 2); // 👈 1열도 오프셋 추가
  addRowPositions(secondRow, 1, 0); // 👈 2열은 오프셋 제거
  addRowPositions(thirdRow, 2, horizontalSpacing / 2); // 👈 3열도 오프셋 추가

  return positions;
};
