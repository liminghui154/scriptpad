export interface Category {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface Script {
  id: number;
  name: string;
  description: string;
  script_type: 'file' | 'inline';
  file_path: string | null;
  content: string | null;
  shell: string;
  working_dir: string | null;
  category_id: number | null;
  tags: string; // JSON array string
  params_schema: string; // JSON array string
  created_at: string;
  updated_at: string;
}

export interface ParamSchema {
  name: string;
  label: string;
  default: string;
  required: boolean;
}

export interface ParamPreset {
  id: number;
  script_id: number;
  name: string;
  params: string; // JSON object string
  created_at: string;
}

export interface ExecutionHistory {
  id: number;
  script_id: number;
  params: string;
  exit_code: number | null;
  output_summary: string | null;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
}

export interface ScriptOutput {
  execution_id: number;
  stream: 'stdout' | 'stderr';
  data: string;
}

export interface ExecutionComplete {
  execution_id: number;
  exit_code: number;
  duration_ms: number;
}

export interface CreateScript {
  name: string;
  description?: string;
  script_type: string;
  file_path?: string;
  content?: string;
  shell?: string;
  working_dir?: string;
  category_id?: number;
  tags?: string;
  params_schema?: string;
}

export interface UpdateScript {
  name?: string;
  description?: string;
  script_type?: string;
  file_path?: string;
  content?: string;
  shell?: string;
  working_dir?: string;
  category_id?: number;
  tags?: string;
  params_schema?: string;
}
