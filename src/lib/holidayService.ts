
export interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

export const holidayService = {
  fetchHolidays: async (year: number, countryCode: string = 'IN'): Promise<Holiday[]> => {
    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
      if (!response.ok) throw new Error('Failed to fetch holidays');
      return await response.json();
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return [];
    }
  }
};
