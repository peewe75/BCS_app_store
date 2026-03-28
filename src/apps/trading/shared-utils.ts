export function extractYearsFromDates(dates: (Date | null | undefined)[]): number[] {
  return Array.from(
    new Set(
      dates
        .map((date) => date?.getFullYear())
        .filter((year): year is number => Number.isFinite(year))
    )
  ).sort((left, right) => right - left)
}
