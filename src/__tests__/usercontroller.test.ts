// Adjust the path accordingly

import { getDateWithOffset } from "../Utilities/Helper";

describe("getDateWithOffset", () => {
  // Mock the Date object to return a fixed date
  const mockedDate = new Date("2024-09-30T12:00:00Z"); // UTC time

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockedDate); // Freeze time to the mocked date
  });

  afterAll(() => {
    jest.useRealTimers(); // Reset Jest's fake timers
  });

  it("should return the date with an offset of 1 hour (60 * 60 seconds)", () => {
    const result = getDateWithOffset(60 * 60); // Offset of 1 hour
    const expectedDate = new Date("2024-09-30T13:00:00Z"); // 1 hour later
    expect(result).toEqual(expectedDate);
  });

  it("should return the date with an offset of -1 hour (-(60 * 60) seconds)", () => {
    const result = getDateWithOffset(-60 * 60); // Offset of -1 hour
    const expectedDate = new Date("2024-09-30T11:00:00Z"); // 1 hour earlier
    expect(result).toEqual(expectedDate);
  });

  it("should return the date with an offset of 24 hours (60 * 60 * 24 seconds)", () => {
    const result = getDateWithOffset(60 * 60 * 24); // Offset of 24 hours
    const expectedDate = new Date("2024-10-01T12:00:00Z"); // 24 hours later
    expect(result).toEqual(expectedDate);
  });
});
