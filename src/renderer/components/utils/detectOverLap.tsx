function doItemsOverlap(item1, item2) {
  const rect1 = { x: item1.position.x, y: item1.position.y, width: 50, height: 50 }; // Assuming fixed size for simplicity
  const rect2 = { x: item2.position.x, y: item2.position.y, width: 50, height: 50 };

  return !(
    rect1.x + rect1.width < rect2.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.x + rect2.width < rect1.x ||
    rect2.y + rect2.height < rect1.y
  )
}
