function mergeItems(item1, item2) {
  setDroppedItems((currentItems) => {
    const filteredItems = currentItems.filter(item => item.id !== item1.id && item.id !== item2.id);
    const mergedItem = {
      id: generateUniqueId(), // Generate a unique ID for the merged item
      type: item1.type, // Assuming item1 and item2 have the same type
      position: { x: (item1.position.x + item2.position.x) / 2, y: (item1.position.y + item2.position.y) / 2 },
      // Add any other properties needed for the merged item
    };
    return [...filteredItems, mergedItem];
  });
}
