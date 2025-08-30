// Import JSON data - using require for compatibility
const commoditiesData: Array<{commodity_id: number, commodity_name: string}> = require('../commodities.json');
const geographiesData: Array<{census_state_id: number, census_state_name: string, census_district_id: number, census_district_name: string}> = require('../geographies.json');

export interface Commodity {
  commodity_id: number;
  commodity_name: string;
}

export interface State {
  state_id: number;
  state_name: string;
}

export interface District {
  district_id: number;
  district_name: string;
}

// Load commodities from local JSON file
export function getCommodities(): Commodity[] {
  return commoditiesData;
}

// Load states from local JSON file
export function getStates(): State[] {
  // Extract unique states from geographies data
  const stateMap = new Map<number, string>();
  
  geographiesData.forEach(geo => {
    if (!stateMap.has(geo.census_state_id)) {
      stateMap.set(geo.census_state_id, geo.census_state_name);
    }
  });
  
  return Array.from(stateMap.entries()).map(([id, name]) => ({
    state_id: id,
    state_name: name
  })).sort((a, b) => a.state_name.localeCompare(b.state_name));
}

// Load districts for a specific state from local JSON file
export function getDistricts(stateId: number): District[] {
  return geographiesData
    .filter(geo => geo.census_state_id === stateId)
    .map(geo => ({
      district_id: geo.census_district_id,
      district_name: geo.census_district_name
    }))
    .sort((a, b) => a.district_name.localeCompare(b.district_name));
}

// Get state name by ID
export function getStateName(stateId: number): string {
  const state = getStates().find(s => s.state_id === stateId);
  return state?.state_name || 'Unknown';
}

// Get district name by ID
export function getDistrictName(stateId: number, districtId: number): string {
  const districts = getDistricts(stateId);
  const district = districts.find(d => d.district_id === districtId);
  return district?.district_name || 'Unknown';
}

// Get commodity name by ID
export function getCommodityName(commodityId: number): string {
  const commodity = getCommodities().find(c => c.commodity_id === commodityId);
  return commodity?.commodity_name || 'Unknown';
}
