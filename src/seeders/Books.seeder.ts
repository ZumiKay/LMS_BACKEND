import Book from "../models/book.model";

export const SeedPopularBook = async () => {
  try {
    const bookIds = [1, 6, 12, 24, 28, 32];

    await Promise.all(
      bookIds.map(async (id) => {
        // Assigning a random borrow_count value between 10 and 100 for variety
        const borrowCount = Math.floor(Math.random() * 91) + 10;
        await Book.update({ borrow_count: borrowCount }, { where: { id } });
      })
    );

    console.log("Popular books seeded successfully.");
  } catch (error) {
    console.log("Seed Popular Book Error:", error);
    return null;
  }
};
