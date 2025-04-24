declare module "*/final_detailed_career_roadmaps.json" {
  interface RoadmapPhase {
    title: string;
    topics: string[];
  }

  interface CareerRoadmap {
    title: string;
    phases: RoadmapPhase[];
  }

  const value: Record<string, CareerRoadmap>;
  export default value;
} 