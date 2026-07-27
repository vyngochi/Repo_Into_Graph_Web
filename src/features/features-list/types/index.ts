export interface FeatureDetail {
  id: string;
  name: string;
  description?: string;
  entryPoint?: string;
  dataFlowMermaidGraph?: string;
  steps?: FeatureStep[];
}

export interface FeatureStep {
  id?: string;
  stepOrder: number;
  callerClass: string;
  callerMethod: string;
  calleeClass: string;
  calleeMethod: string;
}

export interface FeaturePagedResult {
  items: FeatureDetail[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
