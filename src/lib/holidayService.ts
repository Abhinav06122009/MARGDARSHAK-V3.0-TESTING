
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
  fetchHolidays: async (year: number): Promise<Holiday[]> => {
    try {
      // Use the Lloyd-Hansen Indian Festivals API data directly from GitHub raw content
      const response = await fetch(`https://raw.githubusercontent.com/Lloyd-Hansen/indian-festivals-api/main/data/festivals.json`);
      if (!response.ok) throw new Error('Failed to fetch Indian festivals');
      
      const json = await response.json();
      const yearData = json.data[year.toString()] || [];
      
      // Transform to match our internal Holiday interface
      return yearData.map((f: any) => ({
        date: f.date,
        localName: f.name,
        name: f.name,
        countryCode: 'IN',
        fixed: true,
        global: f.states.includes('All India'),
        counties: f.states.includes('All India') ? null : f.states,
        launchYear: null,
        types: [f.type],
        description: f.description
      }));
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return [];
    }
  }
};
