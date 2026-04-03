import { invoke } from '@tauri-apps/api/core';
import type {
  Category,
  Script,
  ParamPreset,
  ExecutionHistory,
} from './types';

// Categories
export const listCategories = () =>
  invoke<Category[]>('list_categories');

export const createCategory = (name: string, icon: string) =>
  invoke<Category>('create_category', { name, icon });

export const deleteCategory = (id: number) =>
  invoke<void>('delete_category', { id });

// Scripts
export const listScripts = (categoryId?: number, search?: string) =>
  invoke<Script[]>('list_scripts', { categoryId, search });

export const getScript = (id: number) =>
  invoke<Script>('get_script', { id });

export const createScript = (script: Omit<Script, 'id' | 'created_at' | 'updated_at'>) =>
  invoke<Script>('create_script', { script });

export const updateScript = (id: number, script: Partial<Omit<Script, 'id' | 'created_at' | 'updated_at'>>) =>
  invoke<Script>('update_script', { id, script });

export const deleteScript = (id: number) =>
  invoke<void>('delete_script', { id });

export const readFileContent = (path: string) =>
  invoke<string>('read_file_content', { path });

// Execution
export const executeScript = (scriptId: number, params: Record<string, string>) =>
  invoke<number>('execute_script', { scriptId, params });

export const stopExecution = (executionId: number) =>
  invoke<void>('stop_execution', { executionId });

// History
export const listHistory = (scriptId: number) =>
  invoke<ExecutionHistory[]>('list_history', { scriptId });

// Presets
export const listPresets = (scriptId: number) =>
  invoke<ParamPreset[]>('list_presets', { scriptId });

export const savePreset = (scriptId: number, name: string, params: Record<string, string>) =>
  invoke<ParamPreset>('save_preset', { scriptId, name, params });

export const deletePreset = (id: number) =>
  invoke<void>('delete_preset', { id });
