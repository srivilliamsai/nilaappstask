export interface AssessmentMetadata {
  maxScore: number;
  passingScore: number;
}

export interface UnitMetadata {
  recommendedMinutes?: number;
}

export interface ComponentMetadata {
  assessment?: AssessmentMetadata;
  unit?: UnitMetadata;
}

export interface ContentComponent {
  id: string;
  title: string;
  shortDescription: string;
  type: 'unit' | 'assessment';
  approximateDurationMinutes: number;
  metadata?: ComponentMetadata;
}

export interface ComponentListResponse {
  items: ContentComponent[];
  totalCount: number;
}
