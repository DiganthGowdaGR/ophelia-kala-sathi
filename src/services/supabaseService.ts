// Centralized Supabase Service with Error Handling and Retry Logic
// Provides type-safe, robust database operations throughout the application

import { supabase } from '@/lib/supabase';
import type { PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js';

// Configuration
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30000;

// Custom Error Types
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string,
    public hint?: string,
    public originalError?: PostgrestError
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export class SupabaseNetworkError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'SupabaseNetworkError';
  }
}

export class SupabaseAuthError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'SupabaseAuthError';
  }
}

export class SupabaseValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'SupabaseValidationError';
  }
}

// Type definitions for common operations
export interface QueryOptions {
  retryOnError?: boolean;
  timeout?: number;
  throwOnEmpty?: boolean;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface FilterOptions {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
  value: any;
}

// Utility Functions
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof SupabaseNetworkError) {
    return true;
  }
  if (error instanceof SupabaseError) {
    // Retry on connection issues, timeouts, and server errors
    const retryableCodes = ['PGRST301', '08000', '08003', '08006', '57014'];
    return error.code ? retryableCodes.includes(error.code) : false;
  }
  return false;
}

function handleSupabaseError(error: PostgrestError, operation: string): never {
  console.error(`Supabase ${operation} error:`, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    timestamp: new Date().toISOString(),
  });

  // Provide user-friendly error messages
  let message = error.message;
  
  if (error.code === '23505') {
    message = 'This record already exists. Please try with different values.';
  } else if (error.code === '23503') {
    message = 'Cannot complete operation due to related records. Please check dependencies.';
  } else if (error.code === '42P01') {
    message = 'Database table not found. Please contact support.';
  } else if (error.code === '42501') {
    message = 'You do not have permission to perform this action.';
  } else if (error.code?.startsWith('PGRST')) {
    message = 'A database error occurred. Please try again or contact support.';
  }

  throw new SupabaseError(message, error.code, error.details, error.hint, error);
}

async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: QueryOptions = {},
  attempt = 1
): Promise<T> {
  try {
    const timeout = options.timeout || REQUEST_TIMEOUT_MS;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    );

    const result = await Promise.race([operation(), timeoutPromise]);
    return result;
  } catch (error) {
    // Handle network and timeout errors
    if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('network'))) {
      const networkError = new SupabaseNetworkError(
        `Network error during ${operationName}. Please check your connection.`,
        error
      );

      if (options.retryOnError !== false && attempt < MAX_RETRY_ATTEMPTS) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`Retrying ${operationName} (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS}) after ${delayMs}ms...`);
        await delay(delayMs);
        return executeWithRetry(operation, operationName, options, attempt + 1);
      }

      throw networkError;
    }

    // Retry logic for retryable errors
    if (options.retryOnError !== false && isRetryableError(error) && attempt < MAX_RETRY_ATTEMPTS) {
      const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(`Retrying ${operationName} (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS}) after ${delayMs}ms...`);
      await delay(delayMs);
      return executeWithRetry(operation, operationName, options, attempt + 1);
    }

    throw error;
  }
}

// Generic CRUD Operations

/**
 * Fetch multiple records from a table
 */
export async function fetchRecords<T = any>(
  table: string,
  options: QueryOptions & {
    select?: string;
    filters?: FilterOptions[];
    orderBy?: { column: string; ascending?: boolean };
    pagination?: PaginationOptions;
  } = {}
): Promise<T[]> {
  return executeWithRetry(
    async () => {
      let query = supabase.from(table).select(options.select || '*');

      // Apply filters
      if (options.filters) {
        options.filters.forEach(filter => {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(filter.column, filter.value);
              break;
            case 'neq':
              query = query.neq(filter.column, filter.value);
              break;
            case 'gt':
              query = query.gt(filter.column, filter.value);
              break;
            case 'gte':
              query = query.gte(filter.column, filter.value);
              break;
            case 'lt':
              query = query.lt(filter.column, filter.value);
              break;
            case 'lte':
              query = query.lte(filter.column, filter.value);
              break;
            case 'like':
              query = query.like(filter.column, filter.value);
              break;
            case 'ilike':
              query = query.ilike(filter.column, filter.value);
              break;
            case 'in':
              query = query.in(filter.column, filter.value);
              break;
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Apply pagination
      if (options.pagination) {
        const { page, pageSize } = options.pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error, `fetchRecords from ${table}`);
      }

      if (options.throwOnEmpty && (!data || data.length === 0)) {
        throw new SupabaseValidationError(`No records found in ${table}`);
      }

      return (data || []) as T[];
    },
    `fetchRecords from ${table}`,
    options
  );
}

/**
 * Fetch a single record by ID
 */
export async function fetchRecordById<T = any>(
  table: string,
  id: string,
  options: QueryOptions & { select?: string } = {}
): Promise<T | null> {
  return executeWithRetry(
    async () => {
      const { data, error } = await supabase
        .from(table)
        .select(options.select || '*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        handleSupabaseError(error, `fetchRecordById from ${table}`);
      }

      if (options.throwOnEmpty && !data) {
        throw new SupabaseValidationError(`Record with ID ${id} not found in ${table}`);
      }

      return data as T | null;
    },
    `fetchRecordById from ${table}`,
    options
  );
}

/**
 * Insert a new record
 */
export async function insertRecord<T = any>(
  table: string,
  record: Partial<T>,
  options: QueryOptions & { select?: string } = {}
): Promise<T> {
  return executeWithRetry(
    async () => {
      const { data, error } = await supabase
        .from(table)
        .insert([record])
        .select(options.select || '*')
        .single();

      if (error) {
        handleSupabaseError(error, `insertRecord into ${table}`);
      }

      if (!data) {
        throw new SupabaseError(`Failed to insert record into ${table}`);
      }

      return data as T;
    },
    `insertRecord into ${table}`,
    options
  );
}

/**
 * Insert multiple records
 */
export async function insertRecords<T = any>(
  table: string,
  records: Partial<T>[],
  options: QueryOptions & { select?: string } = {}
): Promise<T[]> {
  return executeWithRetry(
    async () => {
      const { data, error } = await supabase
        .from(table)
        .insert(records)
        .select(options.select || '*');

      if (error) {
        handleSupabaseError(error, `insertRecords into ${table}`);
      }

      return (data || []) as T[];
    },
    `insertRecords into ${table}`,
    options
  );
}

/**
 * Update a record by ID
 */
export async function updateRecord<T = any>(
  table: string,
  id: string,
  updates: Partial<T>,
  options: QueryOptions & { select?: string } = {}
): Promise<T> {
  return executeWithRetry(
    async () => {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select(options.select || '*')
        .single();

      if (error) {
        handleSupabaseError(error, `updateRecord in ${table}`);
      }

      if (!data) {
        throw new SupabaseValidationError(`Record with ID ${id} not found in ${table}`);
      }

      return data as T;
    },
    `updateRecord in ${table}`,
    options
  );
}

/**
 * Update multiple records with filters
 */
export async function updateRecords<T = any>(
  table: string,
  updates: Partial<T>,
  filters: FilterOptions[],
  options: QueryOptions & { select?: string } = {}
): Promise<T[]> {
  return executeWithRetry(
    async () => {
      let query = supabase.from(table).update(updates);

      // Apply filters
      filters.forEach(filter => {
        if (filter.operator === 'eq') {
          query = query.eq(filter.column, filter.value);
        }
      });

      const { data, error } = await query.select(options.select || '*');

      if (error) {
        handleSupabaseError(error, `updateRecords in ${table}`);
      }

      return (data || []) as T[];
    },
    `updateRecords in ${table}`,
    options
  );
}

/**
 * Delete a record by ID
 */
export async function deleteRecord(
  table: string,
  id: string,
  options: QueryOptions = {}
): Promise<void> {
  return executeWithRetry(
    async () => {
      const { error } = await supabase.from(table).delete().eq('id', id);

      if (error) {
        handleSupabaseError(error, `deleteRecord from ${table}`);
      }
    },
    `deleteRecord from ${table}`,
    options
  );
}

/**
 * Delete multiple records with filters
 */
export async function deleteRecords(
  table: string,
  filters: FilterOptions[],
  options: QueryOptions = {}
): Promise<void> {
  return executeWithRetry(
    async () => {
      let query = supabase.from(table).delete();

      // Apply filters
      filters.forEach(filter => {
        if (filter.operator === 'eq') {
          query = query.eq(filter.column, filter.value);
        }
      });

      const { error } = await query;

      if (error) {
        handleSupabaseError(error, `deleteRecords from ${table}`);
      }
    },
    `deleteRecords from ${table}`,
    options
  );
}

/**
 * Count records in a table
 */
export async function countRecords(
  table: string,
  filters?: FilterOptions[],
  options: QueryOptions = {}
): Promise<number> {
  return executeWithRetry(
    async () => {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });

      // Apply filters
      if (filters) {
        filters.forEach(filter => {
          if (filter.operator === 'eq') {
            query = query.eq(filter.column, filter.value);
          }
        });
      }

      const { count, error } = await query;

      if (error) {
        handleSupabaseError(error, `countRecords in ${table}`);
      }

      return count || 0;
    },
    `countRecords in ${table}`,
    options
  );
}

/**
 * Execute a raw SQL query via RPC
 */
export async function executeRPC<T = any>(
  functionName: string,
  params: Record<string, any> = {},
  options: QueryOptions = {}
): Promise<T> {
  return executeWithRetry(
    async () => {
      const { data, error } = await supabase.rpc(functionName, params);

      if (error) {
        handleSupabaseError(error, `executeRPC ${functionName}`);
      }

      return data as T;
    },
    `executeRPC ${functionName}`,
    options
  );
}

/**
 * Check if a record exists
 */
export async function recordExists(
  table: string,
  filters: FilterOptions[],
  options: QueryOptions = {}
): Promise<boolean> {
  return executeWithRetry(
    async () => {
      let query = supabase.from(table).select('id', { count: 'exact', head: true });

      filters.forEach(filter => {
        if (filter.operator === 'eq') {
          query = query.eq(filter.column, filter.value);
        }
      });

      const { count, error } = await query;

      if (error) {
        handleSupabaseError(error, `recordExists in ${table}`);
      }

      return (count || 0) > 0;
    },
    `recordExists in ${table}`,
    options
  );
}

// Export the supabase client for direct use when needed
export { supabase };

export default {
  fetchRecords,
  fetchRecordById,
  insertRecord,
  insertRecords,
  updateRecord,
  updateRecords,
  deleteRecord,
  deleteRecords,
  countRecords,
  executeRPC,
  recordExists,
};
