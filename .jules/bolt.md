## 2024-05-24 - Prisma createMany batching
**Learning:** When using Prisma's createMany with nested records (like questions in a quiz), we must ensure tests reflect the correct mocked createMany call in Vitest.
**Action:** When swapping sequential create for createMany, always check Vitest mocks under prisma.mockModel to update createMany representations.
